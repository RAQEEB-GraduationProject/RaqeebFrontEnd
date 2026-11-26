import { useState } from "react";
import { Check, ChevronLeft, Eye } from "lucide-react";

import { DevNotice } from "./badges";
import { formatGenerated, formatResponse } from "./alertHelpers";

const Detail = ({ label, children }) => (
  <div>
    <p className="text-xs text-muted">{label}</p>
    <p className="mt-2 text-sm font-semibold text-ink">{children}</p>
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
          className="flex items-center gap-1 text-xs font-medium text-accent transition hover:text-accent-strong"
        >
          <ChevronLeft size={14} />
          Back to alerts
        </button>

        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-medium text-ink">
              {alert.id} · {alert.event}
            </h1>

            <p className="mt-3 text-sm text-muted-strong">
              {alert.patientName} · Assigned to {alert.doctorName}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {onReview && (
              <button
                type="button"
                onClick={() => onReview(alert)}
                disabled={isReviewed}
                className="flex items-center gap-3 rounded-xl border border-line bg-white px-6 py-4 text-sm font-bold text-ink shadow-sm transition hover:bg-surface-soft disabled:cursor-not-allowed disabled:border-disabled disabled:text-disabled-text disabled:hover:bg-white"
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
                className="flex items-center gap-3 rounded-xl bg-primary px-6 py-4 text-sm font-bold text-on-primary shadow-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-disabled disabled:text-on-disabled disabled:shadow-none"
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
        <section className="rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-7">
          <h2 className="text-base font-medium text-ink">Alert details</h2>

          <p className="mt-1 text-xs text-muted">
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
                className="block text-xs text-muted-strong"
              >
                Internal note
              </label>

              <textarea
                id="internal-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                placeholder="Add a note for the care team…"
                className="mt-3 w-full resize-y rounded-2xl border border-field bg-white px-4 py-4 text-sm text-ink outline-none transition placeholder:text-muted focus:border-focus focus:ring-2 focus:ring-focus/25"
              />

              <button
                type="submit"
                disabled={!note.trim()}
                className="mt-5 rounded-xl bg-primary px-6 py-4 text-xs font-bold text-on-primary shadow-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-disabled disabled:text-on-disabled disabled:shadow-none"
              >
                Add note
              </button>
            </form>
          )}

          {alert.notes.length > 0 && (
            <ul className="mt-8 space-y-3 border-t border-line-soft pt-6">
              {alert.notes.map((item, index) => (
                <li key={index} className="rounded-xl bg-surface-soft px-4 py-3">
                  <p className="whitespace-pre-wrap break-words text-sm text-ink">
                    {item.text}
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    {item.author ? `${item.author} · ` : ""}
                    {item.time}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-7">
          <h2 className="border-b border-line pb-2 text-base font-medium text-ink">
            Escalation timeline
          </h2>

          <ol>
            {alert.timeline.map((step, index) => (
              <li
                key={index}
                className="flex items-start gap-3 border-b border-line-soft py-5 last:border-b-0"
              >
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    step.tone === "alert" ? "bg-danger" : "bg-success"
                  }`}
                />

                <span className="w-11 shrink-0 text-xs text-muted">
                  {step.time}
                </span>

                <div>
                  <p className="text-sm font-semibold text-ink">
                    {step.title}
                  </p>

                  <p className="mt-1 text-xs text-muted">{step.detail}</p>
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
