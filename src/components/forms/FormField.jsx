// Label + control + inline error, shared by the admin forms.
const FormField = ({ id, label, error, children }) => (
  <div>
    <label htmlFor={id} className="mb-2 block text-xs font-medium text-teal-800">
      {label}
    </label>

    {children}

    {error && (
      <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-red-600">
        {error}
      </p>
    )}
  </div>
);

export default FormField;
