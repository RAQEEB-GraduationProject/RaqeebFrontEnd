import { X } from "lucide-react";

import SearchPicker from "../../../../components/patients/SearchPicker";

// Bulk mode only: pick which patients receive the care team.
const PatientSelector = ({ patients, selectedIds, onChange }) => {
  const selected = patients.filter((patient) => selectedIds.includes(patient.id));

  const items = patients
    .filter((patient) => !selectedIds.includes(patient.id))
    .map((patient) => ({
      id: patient.id,
      title: patient.userName,
      subtitle: patient.medicalRecordNumber,
    }));

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-base font-semibold text-[#0b2a3d]">Patients</h3>
        <p className="text-sm text-slate-500">Select one or more patients</p>
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((patient) => (
            <span
              key={patient.id}
              className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-[#0b2a3d]"
            >
              {patient.userName}

              <button
                type="button"
                aria-label={`Remove ${patient.userName}`}
                onClick={() =>
                  onChange(selectedIds.filter((id) => id !== patient.id))
                }
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}

      <SearchPicker
        items={items}
        placeholder="Add a patient"
        searchPlaceholder="Search by patient name or ID…"
        onPick={(id) => onChange([...selectedIds, id])}
      />
    </div>
  );
};

export default PatientSelector;
