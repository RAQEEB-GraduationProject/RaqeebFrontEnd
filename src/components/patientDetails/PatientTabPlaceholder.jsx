// Temporary stand-in until each tab's real page is built.
const PatientTabPlaceholder = ({ title }) => (
  <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
    <p className="text-sm font-semibold text-slate-800">{title}</p>
    <p className="mt-1 text-sm text-slate-500">This section is coming soon.</p>
  </div>
);

export default PatientTabPlaceholder;
