import { useState } from "react";
import { Check, ChevronLeft, Eye } from "lucide-react";

import { DevNotice } from "./badges";
import { formatGenerated, formatResponse } from "./alertHelpers";

const Detail = ({ label, children }) => (
  <div>
    <p className="text-xs text-slate-400">{label}</p>
    <p className="mt-2 text-sm font-semibold text-[#0b2a3d]">{children}</p>
  </div>
);

// onResolve / onReview / onAddNote are optional: a role only sees the actions
// its page passes in.
const AlertDetails = ({
  alert,
  devNotice,
  onBack,
  onResolve,
  onReview,
  onAddNote,
}) => {
  const [note, setNote] = useState("");

  const isResolved = alert.status === "Resolved";
  const isReviewed = Boolean(alert.reviewedAt);

  const submitNote = (e) => {
    e.preventDefault();

    if (!note.trim()) return;

    onAddNote(alert.id, note.trim());
    setNote("");
  };

  return (
    <div className="space-y-8">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-medium text-teal-800 transition hover:text-[#0f3d4c]"
        >
          <ChevronLeft size={14} />
          Back to alerts
        </button>

        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-medium text-[#0b2a3d]">
              {alert.id} · {alert.event}
            </h1>

            <p className="mt-3 text-sm text-slate-500">
              {alert.patientName} · Assigned to {alert.doctorName}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {onReview && (
              <button
                type="button"
                onClick={() => onReview(alert)}
                disabled={isReviewed}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-[#0b2a3d] shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Eye size={18} />
                {isReviewed ? "Reviewed" : "Mark as reviewed"}
              </button>
            )}

            {onResolve && (
              <button
                type="button"
                onClick={() => onResolve(alert)}
                disabled={isResolved}
                className="flex items-center gap-3 rounded-xl bg-[#0f3d4c] px-6 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#0b3240] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check size={18} />
                {isResolved ? "Resolved" : "Resolve alert"}
              </button>
            )}
          </div>
        </div>
      </div>

      {devNotice && <DevNotice text={devNotice} />}

      <div className="grid items-start gap-6 lg:grid-cols-[1.9fr_1fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <h2 className="text-base font-medium text-[#0b2a3d]">Alert details</h2>

          <p className="mt-1 text-xs text-slate-400">
            Clinical event and response information
          </p>

          <div className="mt-8 grid gap-x-5 gap-y-7 sm:grid-cols-2">
            <Detail label="Severity">{alert.color}</Detail>
            <Detail label="Status">{alert.status}</Detail>
            <Detail label="Generated">{formatGenerated(alert.createdAt)}</Detail>
            <Detail label="Response time">
              {formatResponse(alert.responseMinutes)}
            </Detail>
            <Detail label="Review">
              {isReviewed
                ? `Reviewed by ${alert.reviewedBy ?? "—"}`
                : "Not reviewed"}
            </Detail>
            <Detail label="Source">{alert.source}</Detail>
            <Detail label="Rule">{alert.rule}</Detail>
          </div>

          {onAddNote && (
            <form onSubmit={submitNote} className="mt-8">
              <label
                htmlFor="internal-note"
                className="block text-xs text-slate-500"
              >
                Internal note
              </label>

              <textarea
                id="internal-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                placeholder="Add a note for the care team…"
                className="mt-3 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-[#0b2a3d] outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
              />

              <button
                type="submit"
                disabled={!note.trim()}
                className="mt-5 rounded-xl bg-[#0f3d4c] px-6 py-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#0b3240] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add note
              </button>
            </form>
          )}

          {alert.notes.length > 0 && (
            <ul className="mt-8 space-y-3 border-t border-slate-100 pt-6">
              {alert.notes.map((item, index) => (
                <li key={index} className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="whitespace-pre-wrap break-words text-sm text-[#0b2a3d]">
                    {item.text}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {item.author ? `${item.author} · ` : ""}
                    {item.time}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <h2 className="border-b border-slate-200 pb-2 text-base font-medium text-[#0b2a3d]">
            Escalation timeline
          </h2>

          <ol>
            {alert.timeline.map((step, index) => (
              <li
                key={index}
                className="flex items-start gap-3 border-b border-slate-100 py-5 last:border-b-0"
              >
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    step.tone === "alert" ? "bg-rose-500" : "bg-emerald-500"
                  }`}
                />

                <span className="w-11 shrink-0 text-xs text-slate-400">
                  {step.time}
                </span>

                <div>
                  <p className="text-sm font-semibold text-[#0b2a3d]">
                    {step.title}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
};

export default AlertDetails;
