import { useAuthStore } from "../../store/authStore";
import getInitials from "../patients/getInitials";
import { profileRoleConfig } from "../../data/mockProfiles";
import profileThemes from "./profileThemes";
import PageHeading from "./PageHeading";
import ProfileCard from "./ProfileCard";

const NOT_AVAILABLE = "Not available";

const capitalize = (value) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : "";

// All fields come from the login session (authStore). Makes no API calls.
// Fields the backend does not return show NOT_AVAILABLE.
const ProfilePage = ({ role }) => {
  const { title, description, roleLabel } = profileRoleConfig[role];
  const theme = profileThemes[role];
  const user = useAuthStore((state) => state.user);

  const username = user?.userName || user?.name || NOT_AVAILABLE;
  const roleText =
    user?.roles?.length > 0
      ? user.roles.map(capitalize).join(", ")
      : capitalize(user?.role) || roleLabel;

  const rows = [
    { label: "Username", value: username },
    { label: "User ID", value: user?.userId || NOT_AVAILABLE },
    { label: "Role", value: roleText },
    { label: "Hospital ID", value: user?.hospitalId || NOT_AVAILABLE },
    { label: "Email", value: user?.email || NOT_AVAILABLE },
    { label: "Phone number", value: user?.phoneNumber || NOT_AVAILABLE },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeading title={title} description={description} />

      <div className="flex items-center gap-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div
          className={`flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-2xl text-lg font-semibold ${theme.avatar}`}
        >
          {getInitials(username)}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-medium text-slate-900">
            {username}
          </h2>
          <span
            className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${theme.badge}`}
          >
            {roleText}
          </span>
        </div>
      </div>

      <ProfileCard title="Account information">
        <dl>
          {rows.map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between gap-4 border-t border-slate-100 py-4 text-sm"
            >
              <dt className="text-slate-500">{label}</dt>
              <dd className="break-all text-right font-semibold text-slate-900">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </ProfileCard>
    </div>
  );
};

export default ProfilePage;
