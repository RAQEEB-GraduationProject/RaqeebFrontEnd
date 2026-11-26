const PageHeading = ({ title, description, action }) => (
  <div className="flex flex-wrap items-start justify-between gap-4">
    <div>
      <h1 className="text-3xl font-medium text-ink">{title}</h1>
      <p className="mt-2 text-muted-strong">{description}</p>
    </div>
    {action}
  </div>
);

export default PageHeading;
