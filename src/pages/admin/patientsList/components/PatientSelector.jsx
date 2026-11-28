import { X } from "lucide-react";

import SearchPicker from "../../../../components/patients/SearchPicker";

// Bulk mode only: pick which patients receive the care team.
const PatientSelector = ({ patients, selectedIds, onChange }) => {
  const selected = patients.filter((patient) => selectedIds.includes(patient.id));

  const items = patients
    .filter((patient) => !selectedIds.includes(patient.id))
    .map((patient) => ({
      id: patient.id,
      title: patient.name,
      subtitle: patient.medicalRecordNumber,
      keywords: patient.userName,
    }));

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-base font-semibold text-ink">Patients</h3>
        <p className="text-sm text-muted-strong">Select one or more patients</p>
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((patient) => (
            <span
              key={patient.id}
              className="inline-flex items-center gap-2 rounded-full bg-surface-muted px-3 py-1.5 text-sm font-semibold text-ink"
            >
              {patient.name}

              <button
                type="button"
                aria-label={`Remove ${patient.name}`}
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
