import { Info } from "lucide-react";
import getInitials from "../patients/getInitials";
import { placeholderAccount, profileRoleConfig } from "../../data/mockProfiles";
import profileThemes from "./profileThemes";
import PageHeading from "./PageHeading";
import ProfileCard from "./ProfileCard";

// UI-only: renders placeholder data, makes no API calls and reads no store.
const ProfilePage = ({ role }) => {
  const { title, description, roleLabel } = profileRoleConfig[role];
  const theme = profileThemes[role];
  const account = placeholderAccount;

  const rows = [
    { label: "Username", value: account.username },
    { label: "Email", value: account.email },
    { label: "Phone number", value: account.phoneNumber },
    { label: "Role", value: roleLabel },
    { label: "Hospital ID", value: account.hospitalId },
    { label: "Account status", value: account.status },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeading title={title} description={description} />

      <div
        role="note"
        className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
      >
        <Info size={16} className="mt-0.5 shrink-0" />
        Preview with placeholder data. This page is not connected to your
        account yet.
      </div>

      <div className="flex items-center gap-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div
          className={`flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-2xl text-lg font-semibold ${theme.avatar}`}
        >
          {getInitials(account.username)}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-medium text-slate-900">
            {account.username}
          </h2>
          <span
            className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${theme.badge}`}
          >
            {roleLabel}
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
              <dd className="break-words text-right font-semibold text-slate-900">
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
