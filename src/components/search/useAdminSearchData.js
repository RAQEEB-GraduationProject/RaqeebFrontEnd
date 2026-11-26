import { useEffect, useState } from "react";

import patientService from "../../services/patientService";
import userService from "../../services/userService";
import getErrorMessage from "../../utils/getErrorMessage";

// Users and patients are searched from this many characters.
export const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

const toSource = (result) =>
  result.status === "fulfilled"
    ? { items: result.value, error: null }
    : { items: [], error: getErrorMessage(result.reason) };

/*
  Data behind the Admin navbar search:
    GET /Users     (Admin only)
    GET /Patients  (the whole hospital for an Admin)
  Neither endpoint has a search parameter, so the lists are requested once
  (after the user stops typing) and filtered in the browser. `reset` drops them,
  so the next search reads fresh data. Local state on purpose: the search must
  not change the loading / error state of the Users and Patients pages.

  `data` is null until both requests settled, then
  { users: { items, error }, patients: { items, error } }.
*/
export default function useAdminSearchData(term, enabled) {
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(term), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [term]);

  const needsData =
    enabled &&
    !data &&
    term.length >= MIN_QUERY_LENGTH &&
    debouncedTerm.length >= MIN_QUERY_LENGTH;

  useEffect(() => {
    if (!needsData) return;

    let isCurrent = true;

    Promise.allSettled([userService.getUsers(), patientService.getPatients()]).then(
      ([users, patients]) => {
        if (isCurrent) setData({ users: toSource(users), patients: toSource(patients) });
      },
    );

    return () => {
      isCurrent = false;
    };
  }, [needsData]);

  return { data, reset: () => setData(null) };
}
