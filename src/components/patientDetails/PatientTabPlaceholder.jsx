// Temporary stand-in until each tab's real page is built.
const PatientTabPlaceholder = ({ title }) => (
  <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center">
    <p className="text-sm font-semibold text-ink">{title}</p>
    <p className="mt-1 text-sm text-muted-strong">This section is coming soon.</p>
  </div>
);

export default PatientTabPlaceholder;
