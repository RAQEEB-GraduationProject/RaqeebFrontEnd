// Every role uses the same class names; the colors behind them come from the
// active dashboard theme (data-theme on the layout, defined in index.css).
const dashboardTheme = {
  avatar: "bg-avatar text-on-avatar",
  badge: "bg-accent-muted text-accent-strong",
};

const profileThemes = {
  admin: dashboardTheme,
  doctor: dashboardTheme,
  nurse: dashboardTheme,
};

export default profileThemes;
