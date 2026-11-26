// Shared text-input styling for the admin forms.
const inputClass = (hasError) =>
  `w-full rounded-xl border bg-white px-4 py-4 text-sm text-ink outline-none transition placeholder:text-muted focus:ring-2 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted-strong ${
    hasError
      ? "border-danger focus:border-danger focus:ring-danger/20"
      : "border-field focus:border-focus focus:ring-focus/25"
  }`;

export default inputClass;
