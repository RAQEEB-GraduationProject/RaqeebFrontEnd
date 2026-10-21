const ProfileCard = ({ title, children }) => (
  <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
    {title && (
      <h3 className="mb-4 text-lg font-medium text-slate-900">{title}</h3>
    )}
    {children}
  </section>
);

export default ProfileCard;
