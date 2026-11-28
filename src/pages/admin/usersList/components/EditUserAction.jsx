import { useState } from "react";
import { Pencil } from "lucide-react";

import EditRecordDrawer from "../../../../components/forms/EditRecordDrawer";
import FormField from "../../../../components/forms/FormField";
import inputClass from "../../../../components/forms/inputClass";
import userService from "../../../../services/userService";
import { useUserStore } from "../../../../store/userStore";
import { EMAIL_PATTERN, PHONE_PATTERN } from "../../../../utils/accountValidation";
import notify from "../../patientsList/notify";

// The three fields of PUT /Users/{id}, "" where there is no value.
const toValues = (user) => ({
  fullName: user.fullName ?? "",
  email: user.email ?? "",
  phoneNumber: user.phoneNumber ?? "",
});

// A saved phone number the user didn't touch is never rejected here.
const validate = (values, changed) => {
  const errors = {};
  const email = values.email.trim();
  const phone = values.phoneNumber.trim();

  if (!email) errors.email = "Email is required.";
  else if (changed.includes("email") && !EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (changed.includes("phoneNumber") && phone && !PHONE_PATTERN.test(phone)) {
    errors.phoneNumber = "Enter a valid phone number.";
  }

  return errors;
};

const FIELDS = [
  { name: "fullName", label: "Full name", type: "text", maxLength: 200 },
  { name: "email", label: "Email", type: "email", maxLength: 256 },
  { name: "phoneNumber", label: "Phone number", type: "tel", maxLength: 30 },
];

/*
  "Edit user" of the user details page (Admin): account details only, through
  PUT /Users/{id}. `onSaved(user)` receives the updated user.
*/
const EditUserAction = ({ user, onSaved }) => {
  const updateUser = useUserStore((state) => state.updateUser);
  // The user the drawer was opened for: it closes if another one is shown.
  const [openFor, setOpenFor] = useState(null);

  const close = () => setOpenFor(null);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpenFor(user.id)}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-on-primary transition hover:bg-primary-hover"
      >
        <Pencil size={17} aria-hidden="true" />
        Edit user
      </button>

      {openFor === user.id && (
        <EditRecordDrawer
          key={user.id}
          id={user.id}
          eyebrow="User account"
          title="Edit user"
          description={
            <>
              Account of <strong className="font-semibold">{user.name}</strong>. Username,
              role and password are not changed here.
            </>
          }
          load={userService.getUserById}
          toValues={toValues}
          validate={validate}
          save={updateUser}
          onSaved={(record) => {
            close();
            onSaved(record);
            notify("success", "User updated");
          }}
          onClose={close}
        >
          {({ values, errors, handleChange, isSaving }) =>
            FIELDS.map(({ name, label, type, maxLength }) => (
              <FormField key={name} id={name} label={label} error={errors[name]}>
                <input
                  id={name}
                  name={name}
                  type={type}
                  value={values[name]}
                  onChange={handleChange}
                  disabled={isSaving}
                  maxLength={maxLength}
                  autoComplete="off"
                  placeholder={`Enter ${label.toLowerCase()}`}
                  aria-invalid={Boolean(errors[name])}
                  aria-describedby={errors[name] ? `${name}-error` : undefined}
                  className={inputClass(errors[name])}
                />
              </FormField>
            ))
          }
        </EditRecordDrawer>
      )}
    </>
  );
};

export default EditUserAction;
