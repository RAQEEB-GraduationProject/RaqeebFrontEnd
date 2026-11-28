import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  Mail,
  Phone,
  ShieldCheck,
  CircleCheck,
  CircleX,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";
import userService from "../../../services/userService";
import { useAuthStore } from "../../../store/authStore";
import getErrorMessage from "../../../utils/getErrorMessage";
import EditUserAction from "./components/EditUserAction";

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="flex min-w-0 items-start gap-3 rounded-xl border border-line-soft bg-surface-soft/70 p-4">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
      <Icon size={19} strokeWidth={1.7} />
    </div>

    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium text-muted-strong">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-ink">
        {value || "Not provided"}
      </p>
    </div>
  </div>
);

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const ownUserId = useAuthStore((state) => state.user?.userId);
  const updateSessionUser = useAuthStore((state) => state.updateUser);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await userService.getUserById(id);

        if (isMounted) {
          setUser(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchUser();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleSaved = (saved) => {
    // Only while the saved user is still the one shown.
    setUser((current) => (current?.id === saved.id ? saved : current));

    // Editing your own account: the profile page reads the session.
    if (saved.id === ownUserId) {
      updateSessionUser({ email: saved.email, phoneNumber: saved.phoneNumber });
    }
  };

  const initials = (name = "") =>
    name
      .split(/[\s._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "U";

  if (loading) {
    return (
      <div className="flex min-h-[350px] flex-col items-center justify-center gap-3">
        <LoaderCircle className="animate-spin text-accent" size={32} />
        <p className="text-sm text-muted-strong">Loading user details...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-danger-bg bg-white p-8 text-center shadow-sm">
        <AlertCircle className="mx-auto text-danger" size={36} />
        <h2 className="mt-4 text-lg font-bold text-ink">
          Unable to load user
        </h2>
        <p className="mt-2 text-sm text-muted-strong">
          {error || "The requested user could not be found."}
        </p>

        <button
          type="button"
          onClick={() => navigate("/admin/users")}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-on-primary transition hover:bg-primary-hover"
        >
          <ArrowLeft size={17} />
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate("/admin/users")}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-strong transition hover:text-accent"
          >
            <ArrowLeft size={17} />
            Back to Users
          </button>

          <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
            User Management
          </p>
          <h1 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">
            User Details
          </h1>
          <p className="mt-2 text-sm text-muted-strong">
            View account information and access status.
          </p>
        </div>

        <EditUserAction user={user} onSaved={handleSaved} />
      </div>

      {/* User Profile Card */}
      <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
        <div className="h-2 bg-theme-strip" />

        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-avatar text-2xl font-bold text-on-avatar ring-1 ring-accent-muted">
              {initials(user.name)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="break-words text-xl font-bold text-ink sm:text-2xl">
                  {user.name}
                </h2>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                    user.isActive
                      ? "bg-success-bg text-success-text"
                      : "bg-danger-bg text-danger-text"
                  }`}
                >
                  {user.isActive ? (
                    <CircleCheck size={14} />
                  ) : (
                    <CircleX size={14} />
                  )}
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <p className="mt-2 break-all text-sm text-muted-strong">
                {user.email || "No email provided"}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-lg bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent">
                  {user.role || "No role"}
                </span>
                <span className="rounded-lg bg-surface-muted px-3 py-1.5 text-xs font-medium text-ink-soft">
                  User ID: {user.id || id}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-line-soft" />

        {/* Account Information */}
        <div className="p-6 sm:p-8">
          <div className="mb-5">
            <h3 className="text-base font-bold text-ink">
              Account Information
            </h3>
            <p className="mt-1 text-sm text-muted-strong">
              Contact details and account configuration.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <DetailItem icon={UserRound} label="Full name" value={user.fullName} />

            <DetailItem
              icon={UserRound}
              label="Username"
              value={user.userName}
            />

            <DetailItem icon={Mail} label="Email Address" value={user.email} />

            <DetailItem
              icon={Phone}
              label="Phone Number"
              value={user.phoneNumber}
            />

            <DetailItem icon={ShieldCheck} label="Role" value={user.role} />
          </div>
        </div>
      </section>
    </div>
  );
}
