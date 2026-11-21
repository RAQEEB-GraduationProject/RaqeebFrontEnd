import { useState } from "react";
import { useParams } from "react-router-dom";
import { ChevronRight, Plus } from "lucide-react";

import { useAuthStore } from "../../../store/authStore";
import { canAddMedicalHistory } from "../../../utils/roles";
import {
  MEDICAL_HISTORY_CATEGORIES,
  formatHistoryDate,
} from "../../patients/medicalHistory/medicalHistoryForm";
import MedicalHistoryEntryDrawer from "./MedicalHistoryEntryDrawer";
import usePatientMedicalHistory from "./usePatientMedicalHistory";

/*
  Patient Overview › Medical History (reference: screenshot 095535).
  GET /Patients/{patientId}/medical-history, grouped into the four backend
  categories; "At a glance" shows the backend's totalCount (active records of
  ALL categories). "Add entry" only for Admin / Doctor (the backend enforces
  it). Export / Open care plan from the reference are not shown: no backend.
*/

const Panel = ({ title, text, children }) => (
  <div className="rounded-2xl border border-slate-100 bg-white px-6 py-14 text-center shadow-sm">
    <p className="text-sm font-semibold text-slate-800">{title}</p>
    {text && <p className="mt-1 text-sm text-slate-500">{text}</p>}
    {children}
  </div>
);

// "Lumpectomy · Feb 2025", newest record first (backend order).
const describe = (entry) =>
  [entry.name, formatHistoryDate(entry.date, { short: true })].filter(Boolean).join(" · ");

const summarize = (entries) => {
  if (entries.length === 0) return "No records";
  const more = entries.length - 1;
  return more > 0 ? `${describe(entries[0])} · +${more} more` : describe(entries[0]);
};

const CategoryRow = ({ category, entries, isOpen, onToggle }) => {
  const panelId = `history-${category.key}`;
  const isEmpty = entries.length === 0;

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        disabled={isEmpty}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-4 px-0.5 py-5 text-left transition enabled:hover:bg-slate-50/60 disabled:cursor-default"
      >
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-slate-900">{category.label}</span>
          <span className="mt-1 block truncate text-xs text-slate-400">
            {summarize(entries)}
          </span>
        </span>
        {!isEmpty && (
          <ChevronRight
            size={18}
            aria-hidden="true"
            className={`shrink-0 text-slate-500 transition ${isOpen ? "rotate-90" : ""}`}
          />
        )}
      </button>

      {isOpen && (
        <ul id={panelId} className="mb-5 space-y-3 rounded-xl bg-slate-50 px-4 py-4">
          {entries.map((entry) => (
            <li key={entry.id} className="min-w-0">
              <p className="text-sm font-medium text-slate-800">
                {entry.name}
                <span className="font-normal text-slate-400">
                  {" · "}
                  {formatHistoryDate(entry.date) ?? "No date"}
                </span>
              </p>
              {entry.notes && (
                <p className="mt-0.5 whitespace-pre-line break-words text-xs text-slate-500">
                  {entry.notes}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

const MedicalHistorySection = ({ patientName }) => {
  const { patientId } = useParams();
  const role = useAuthStore((state) => state.user?.role);
  const { history, isLoading, error, retry } = usePatientMedicalHistory(patientId);

  const [openKey, setOpenKey] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const canAdd = canAddMedicalHistory(role);

  let body;
  if (error) {
    body = (
      <Panel title="Couldn't load the medical history" text={error}>
        <button
          type="button"
          onClick={retry}
          className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#3f5ea8] transition hover:bg-slate-50"
        >
          Try again
        </button>
      </Panel>
    );
  } else if (!history && isLoading) {
    body = (
      <div
        aria-busy="true"
        className="rounded-2xl border border-slate-100 bg-white px-6 py-14 text-center text-sm text-slate-500 shadow-sm"
      >
        Loading medical history…
      </div>
    );
  } else if (!history) {
    body = <Panel title="No medical history is available for this patient." />;
  } else {
    body = (
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-medium text-slate-900">Medical History records</h3>
          <p className="mt-1 text-sm text-slate-400">Most recent clinical information</p>

          <ul className="mt-6 divide-y divide-slate-100 border-t border-slate-100">
            {MEDICAL_HISTORY_CATEGORIES.map((category) => (
              <CategoryRow
                key={category.key}
                category={category}
                entries={history[category.key]}
                isOpen={openKey === category.key}
                onToggle={() =>
                  setOpenKey((current) => (current === category.key ? null : category.key))
                }
              />
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-medium text-slate-900">At a glance</h3>
          <p className="mt-1 text-sm text-slate-400">Current medical history summary</p>

          <div className="py-12 text-center">
            <p className="text-4xl font-semibold text-slate-900">{history.totalCount}</p>
            <p className="mt-2 text-xs text-slate-500">
              {history.totalCount === 1 ? "active record" : "active records"}
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-4xl font-medium text-slate-900">Medical History</h2>
          <p className="mt-2 text-base text-slate-500">
            Patient Overview · {patientName} clinical record
          </p>
        </div>

        {canAdd && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#6f8fd6] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5f80c9]"
          >
            <Plus size={18} />
            Add entry
          </button>
        )}
      </div>

      {body}

      {canAdd && isAdding && (
        <MedicalHistoryEntryDrawer
          patientId={patientId}
          patientName={patientName}
          onClose={() => setIsAdding(false)}
          onAdded={(entry) => {
            setIsAdding(false);
            // Open the category of the new record (the list reloads).
            const category = MEDICAL_HISTORY_CATEGORIES.find(
              (item) => item.type.toLowerCase() === String(entry?.type).toLowerCase(),
            );
            if (category) setOpenKey(category.key);
          }}
        />
      )}
    </div>
  );
};

export default MedicalHistorySection;
