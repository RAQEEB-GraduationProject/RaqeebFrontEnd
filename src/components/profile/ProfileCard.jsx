const ProfileCard = ({ title, children }) => (
  <section className="rounded-3xl border border-line-soft bg-white p-6 shadow-sm">
    {title && (
      <h3 className="mb-4 text-lg font-medium text-ink">{title}</h3>
    )}
    {children}
  </section>
);

export default ProfileCard;
