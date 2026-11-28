import { useEffect, useState } from "react";
import { X } from "lucide-react";

import PatientSelector from "./PatientSelector";
import StaffPicker from "./StaffPicker";
import getInitials from "../../../../components/patients/getInitials";

const SECTIONS = [
  {
    role: "doctor",
    title: "Doctor",
    hint: "Select one or more doctors",
    chip: "bg-doctor-bg text-doctor-text",
  },
  {
    role: "nurse",
    title: "Nurse",
    hint: "Select one or more nurses",
    chip: "bg-nurse-bg text-nurse-text",
  },
  {
    role: "caregiver",
    title: "Caregiver",
    hint: "Select one or more caregivers",
    chip: "bg-caregiver-bg text-caregiver-text",
  },
];

const EMPTY_TEAM = { doctor: [], nurse: [], caregiver: [] };

/*
  Two separate workflows:
    lockedPatient set  → single-patient mode. Shows the saved care team (pass
      the current row). `onAdd(userId)` / `onRemove(userId)` each confirm and
      save that one change immediately; there is nothing else to save.
    lockedPatient null → bulk mode. Patients and staff are only selected here;
      `onBulkSubmit(patientIds, team)` confirms and sends them together, and
      resolves true when the drawer can close. Cancel discards the selection.
  Mount it only while open (use a `key`) so its state starts fresh.
*/
const AssignDrawer = ({
  lockedPatient,
  patients,
  staff,
  staffById,
  isSaving,
  onAdd,
  onRemove,
  onBulkSubmit,
  onClose,
}) => {
  // Bulk mode's temporary selection.
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(EMPTY_TEAM);

  const team = lockedPatient ? lockedPatient.assigned : selectedTeam;

  // The drawer stays open until a running request has finished.
  const close = () => {
    if (!isSaving) onClose();
  };

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !isSaving && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isSaving, onClose]);

  const addStaff = (role, id) => {
    if (lockedPatient) {
      onAdd(id);
      return;
    }

    setSelectedTeam((current) => ({ ...current, [role]: [...current[role], id] }));
  };

  const removeStaff = (role, id) => {
    if (lockedPatient) {
      onRemove(id);
      return;
    }

    setSelectedTeam((current) => ({
      ...current,
      [role]: current[role].filter((item) => item !== id),
    }));
  };

  const canSubmit =
    patients.some((patient) => selectedIds.includes(patient.id)) &&
    Object.values(selectedTeam).some((ids) => ids.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-overlay/40"
        onClick={close}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Assign care team"
        className="relative flex h-full w-full max-w-[520px] flex-col bg-white shadow-xl"
      >
        <header className="flex items-start justify-between border-b border-line-soft px-7 py-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
              Care assignment
            </p>

            <h2 className="mt-2 text-3xl font-medium text-ink">
              Assign Care Team
            </h2>

            <p className="mt-2 text-sm text-muted-strong">
              {lockedPatient
                ? "Each addition or removal is saved as soon as you confirm it. Removing someone affects this patient only, not their account."
                : "Choose the patients and the staff responsible for their care. Nothing is saved until you confirm."}
            </p>
          </div>

          <button
            type="button"
            onClick={close}
            disabled={isSaving}
            aria-label="Close"
            className="rounded-xl border border-line p-2.5 text-ink-soft transition hover:bg-surface-soft disabled:cursor-not-allowed disabled:text-disabled-text"
          >
            <X size={18} />
          </button>
        </header>

        {/* Nothing can be changed while a request is running. */}
        <fieldset
          disabled={isSaving}
          className="min-h-0 min-w-0 flex-1 space-y-7 overflow-y-auto px-7 py-6"
        >
          {lockedPatient ? (
            <div className="flex items-center gap-4 rounded-2xl border border-line p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-avatar text-xs font-bold text-on-avatar">
                {getInitials(lockedPatient.name)}
              </div>

              <div>
                <p className="text-base font-semibold text-ink">
                  {lockedPatient.name}
                </p>
                <p className="text-sm text-muted">
                  {lockedPatient.medicalRecordNumber}
                </p>
              </div>
            </div>
          ) : (
            <PatientSelector
              patients={patients}
              selectedIds={selectedIds}
              onChange={setSelectedIds}
            />
          )}

          {SECTIONS.map((section) => (
            <section
              key={section.role}
              className="space-y-3 border-t border-line-soft pt-6"
            >
              <div>
                <h3 className="text-base font-semibold text-ink">
                  {section.title}
                </h3>
                <p className="text-sm text-muted-strong">{section.hint}</p>
              </div>

              {team[section.role].length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {team[section.role].map((id) => (
                    <span
                      key={id}
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${section.chip}`}
                    >
                      {staffById[id]?.name}

                      <button
                        type="button"
                        title={
                          lockedPatient
                            ? "Remove from this patient"
                            : "Remove from selection"
                        }
                        aria-label={`Remove ${staffById[id]?.name}`}
                        onClick={() => removeStaff(section.role, id)}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <StaffPicker
                role={section.role}
                staff={staff}
                selectedIds={team[section.role]}
                onPick={(id) => addStaff(section.role, id)}
                placeholder={
                  team[section.role].length
                    ? `Add another ${section.role}`
                    : `Add ${section.role}`
                }
              />
            </section>
          ))}
        </fieldset>

        <footer className="flex items-center justify-end gap-3 border-t border-line-soft px-7 py-5">
          {lockedPatient && isSaving && (
            <p role="status" className="mr-auto text-sm text-muted-strong">
              Saving…
            </p>
          )}

          <button
            type="button"
            onClick={close}
            disabled={isSaving}
            className="rounded-xl border border-line bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-surface-soft disabled:cursor-not-allowed disabled:text-disabled-text"
          >
            {lockedPatient ? "Close" : "Cancel"}
          </button>

          {!lockedPatient && (
            <button
              type="button"
              disabled={!canSubmit || isSaving}
              onClick={async () => {
                if (await onBulkSubmit(selectedIds, selectedTeam)) onClose();
              }}
              className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-on-primary transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-disabled disabled:text-on-disabled disabled:shadow-none"
            >
              {isSaving ? "Saving…" : "Save assignments"}
            </button>
          )}
        </footer>
      </aside>
    </div>
  );
};

export default AssignDrawer;
