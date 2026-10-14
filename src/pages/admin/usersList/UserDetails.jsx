import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  Mail,
  Phone,
  ShieldCheck,
  Building2,
  CircleCheck,
  CircleX,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";
import userService from "../../../services/userService";

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

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
          setError(
            err.response?.data?.message ||
              "Unable to load user details. Please try again.",
          );
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

  const initials = (name = "") =>
    name
      .split(/[\s._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "U";

  const DetailItem = ({ icon: Icon, label, value }) => (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
        <Icon size={19} strokeWidth={1.7} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-slate-800">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-[350px] flex-col items-center justify-center gap-3">
        <LoaderCircle className="animate-spin text-teal-700" size={32} />
        <p className="text-sm text-slate-500">Loading user details...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
        <AlertCircle className="mx-auto text-red-500" size={36} />
        <h2 className="mt-4 text-lg font-bold text-slate-800">
          Unable to load user
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {error || "The requested user could not be found."}
        </p>

        <button
          type="button"
          onClick={() => navigate("/admin/users")}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0b3a4a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#08263a]"
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
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-teal-700"
          >
            <ArrowLeft size={17} />
            Back to Users
          </button>

          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
            User Management
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[#0b2a3d] sm:text-3xl">
            User Details
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            View account information and access status.
          </p>
        </div>
      </div>

      {/* User Profile Card */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-2 bg-gradient-to-r from-[#0b3a4a] via-teal-600 to-teal-300" />

        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-100 text-2xl font-bold text-teal-800 ring-1 ring-teal-100">
              {initials(user.userName)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="break-words text-xl font-bold text-[#0b2a3d] sm:text-2xl">
                  {user.userName || "Unnamed User"}
                </h2>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                    user.isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
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

              <p className="mt-2 break-all text-sm text-slate-500">
                {user.email || "No email provided"}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800">
                  {user.role || "No role"}
                </span>
                <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                  User ID: {user.id || id}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100" />

        {/* Account Information */}
        <div className="p-6 sm:p-8">
          <div className="mb-5">
            <h3 className="text-base font-bold text-[#0b2a3d]">
              Account Information
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Contact details and account configuration.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

            <DetailItem
              icon={Building2}
              label="Hospital ID"
              value={user.hospitalId}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
