import { useEffect, useRef, useState } from "react";

import { toFormErrors } from "../../utils/formErrors";
import getErrorMessage from "../../utils/getErrorMessage";

/*
  Form state for editing one saved record through an update that replaces every
  field (PUT /Patients/{id}, PUT /Users/{id}).

    id                       the record; mount a new form (key) for another one
    load(id)                 reads the record from the backend (stable function)
    toValues(record)         record -> { field: text } with EVERY editable field
                             (stable function)
    validate(values, changed) -> { field: message }
    save(id, values)         -> { record } or { error }
    errorOptions             passed to toFormErrors
    onSaved(record)

  The form is filled from a fresh read. On save the record is read once more and
  only the fields the user changed are applied on top of it, so every untouched
  field is sent back with its latest value, never with a stale or empty one.
*/
const useEditForm = ({ id, load, toValues, validate, save, errorOptions, onSaved }) => {
  const [snapshot, setSnapshot] = useState(null); // values as loaded
  const [values, setValues] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const isBusy = useRef(false); // blocks a second submit before re-render
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    let isCurrent = true;

    load(id).then(
      (record) => {
        if (!isCurrent) return;
        const loaded = toValues(record);
        setSnapshot(loaded);
        setValues(loaded);
      },
      (error) => {
        if (isCurrent) setLoadError(getErrorMessage(error));
      },
    );

    return () => {
      isCurrent = false;
    };
  }, [id, load, toValues, attempt]);

  const changed = values ? Object.keys(values).filter((key) => values[key] !== snapshot[key]) : [];

  const retry = () => {
    setLoadError(null);
    setAttempt((current) => current + 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isBusy.current || !values) return;

    // A half-typed date reads as "": it must not be saved as "cleared".
    const incomplete = [...e.currentTarget.elements]
      .filter((element) => element.validity?.badInput)
      .map((element) => [element.name, "Enter a complete, valid value."]);
    const nextErrors = { ...validate(values, changed), ...Object.fromEntries(incomplete) };

    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0 || changed.length === 0) return;

    isBusy.current = true;
    setIsSaving(true);

    let result;
    try {
      const latest = toValues(await load(id));
      // Left the page or signed out meanwhile: send nothing.
      if (!isMounted.current) return;

      const edits = Object.fromEntries(changed.map((key) => [key, values[key]]));
      result = await save(id, { ...latest, ...edits });
    } catch (error) {
      result = { error };
    }

    isBusy.current = false;
    if (!isMounted.current) return;
    setIsSaving(false);

    if (result.error) {
      const failure = toFormErrors(result.error, Object.keys(values), errorOptions);
      setErrors(failure.fieldErrors);
      setFormError(failure.formError);
      return;
    }

    onSaved(result.record);
  };

  return {
    values,
    errors,
    formError,
    loadError,
    retry,
    isSaving,
    isDirty: changed.length > 0,
    handleChange,
    handleSubmit,
  };
};

export default useEditForm;
