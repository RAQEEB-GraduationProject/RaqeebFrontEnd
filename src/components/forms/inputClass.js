// Shared text-input styling for the admin forms.
const inputClass = (hasError) =>
  `w-full rounded-xl border bg-white px-4 py-4 text-sm text-[#0b2a3d] outline-none transition placeholder:text-slate-400 focus:ring-2 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
      : "border-slate-200 focus:border-teal-600 focus:ring-teal-600/20"
  }`;

export default inputClass;
