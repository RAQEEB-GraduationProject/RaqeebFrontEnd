import { useEffect, useState } from "react";
import { X } from "lucide-react";

import PatientSelector from "./PatientSelector";
import StaffPicker from "./StaffPicker";
import getInitials from "../../../../components/patients/getInitials";

const SECTIONS = [
  {
    role: "doctor",
    title: "Doctor",
    hint: "Select one primary doctor",
    single: true,
    chip: "bg-sky-50 text-sky-900",
  },
  {
    role: "nurse",
    title: "Nurse",
    hint: "Select one or more nurses",
    chip: "bg-emerald-50 text-emerald-900",
  },
  {
    role: "caregiver",
    title: "Caregiver",
    hint: "Select one or more caregivers",
    chip: "bg-violet-50 text-violet-900",
  },
];

const EMPTY_TEAM = { doctor: [], nurse: [], caregiver: [] };

/*
  lockedPatient set  → row mode: that patient only, no selector.
  lockedPatient null → bulk mode: patient selector is shown.
  Mount it only while open (use a `key`) so its state starts fresh.
*/
const AssignDrawer = ({
  lockedPatient,
  patients,
  staff,
  staffById,
  isSaving,
  onSave,
  onClose,
}) => {
  const [selectedIds, setSelectedIds] = useState(
    lockedPatient ? [lockedPatient.id] : [],
  );
  const [team, setTeam] = useState(
    lockedPatient ? { ...lockedPatient.assigned } : EMPTY_TEAM,
  );

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const addStaff = (section, id) =>
    setTeam((current) => ({
      ...current,
      [section.role]: section.single ? [id] : [...current[section.role], id],
    }));

  const removeStaff = (role, id) =>
    setTeam((current) => ({
      ...current,
      [role]: current[role].filter((item) => item !== id),
    }));

  const canSave = selectedIds.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Assign care team"
        className="relative flex h-full w-full max-w-[520px] flex-col bg-white shadow-xl"
      >
        <header className="flex items-start justify-between border-b border-slate-100 px-7 py-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-700">
              Care assignment
            </p>

            <h2 className="mt-2 text-3xl font-medium text-[#0b2a3d]">
              Assign Care Team
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {lockedPatient
                ? "Choose the staff responsible for this patient's care."
                : "Choose the patients and the staff responsible for their care."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 space-y-7 overflow-y-auto px-7 py-6">
          {lockedPatient ? (
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-xs font-bold text-teal-800">
                {getInitials(lockedPatient.userName)}
              </div>

              <div>
                <p className="text-base font-semibold text-[#0b2a3d]">
                  {lockedPatient.userName}
                </p>
                <p className="text-sm text-slate-400">
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
              className="space-y-3 border-t border-slate-100 pt-6"
            >
              <div>
                <h3 className="text-base font-semibold text-[#0b2a3d]">
                  {section.title}
                </h3>
                <p className="text-sm text-slate-500">{section.hint}</p>
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
                onPick={(id) => addStaff(section, id)}
                placeholder={
                  section.single
                    ? team.doctor.length
                      ? "Change doctor"
                      : "Select doctor"
                    : team[section.role].length
                      ? `Add another ${section.role}`
                      : `Add ${section.role}`
                }
              />
            </section>
          ))}
        </div>

        <footer className="flex justify-end gap-3 border-t border-slate-100 px-7 py-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#0f3d4c] transition hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!canSave || isSaving}
            onClick={async () => {
              if (isSaving) return;
              if (await onSave(selectedIds, team)) onClose();
            }}
            className="rounded-xl bg-[#0f3d4c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b2a3d] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Saving…" : "Save assignments"}
          </button>
        </footer>
      </aside>
    </div>
  );
};

export default AssignDrawer;
