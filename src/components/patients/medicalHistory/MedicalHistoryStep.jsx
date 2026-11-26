import { useState } from "react";
import { CircleCheck } from "lucide-react";

import { usePatientMedicalHistoryStore } from "../../../store/patientMedicalHistoryStore";
import MedicalHistoryEntryForm from "./MedicalHistoryEntryForm";
import { MEDICAL_HISTORY_CATEGORIES, formatHistoryDate } from "./medicalHistoryForm";

/*
  Optional step shown right after a patient profile was created (POST
  /Patients succeeded), so the real `patientId` returned by the backend is
  known. The admin can add any number of records or skip; `onDone(count)`
  finishes the registration either way.
*/
const MedicalHistoryStep = ({ patientId, patientName, onDone }) => {
  const [added, setAdded] = useState([]);
  const isAdding = usePatientMedicalHistoryStore((state) => state.isAdding);

  return (
    <section className="rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-7">
      <h2 className="text-base font-medium text-ink">
        Medical history <span className="text-muted">(optional)</span>
      </h2>

      <p className="mt-1 text-xs text-muted">
        Add diseases, allergies, surgeries or family history for{" "}
        <strong className="font-semibold text-ink-soft">{patientName}</strong>, or skip
        this step. Records can also be added later from the patient's details.
      </p>

      {added.length > 0 && (
        <ul aria-label="Records added" className="mt-6 divide-y divide-line-soft rounded-2xl border border-line-soft">
          {added.map((entry) => {
            const category = MEDICAL_HISTORY_CATEGORIES.find((item) => item.type === entry.type);
            return (
              <li key={entry.id} className="flex items-start gap-3 px-4 py-3">
                <CircleCheck size={16} className="mt-0.5 shrink-0 text-success" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">
                    {category?.singular ?? entry.type}
                    <span className="font-normal text-muted-strong">
                      {" · "}
                      {[entry.name, formatHistoryDate(entry.date, { short: true })]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </p>
                  {entry.notes && (
                    <p className="mt-0.5 break-words text-xs text-muted">{entry.notes}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-6">
        <MedicalHistoryEntryForm
          patientId={patientId}
          onAdded={(entry) => setAdded((prev) => [...prev, entry])}
        />
      </div>

      <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
        <p className="text-xs text-muted-strong">
          {added.length === 0
            ? "No records added yet."
            : `${added.length} ${added.length === 1 ? "record" : "records"} added.`}
        </p>

        <button
          type="button"
          onClick={() => onDone(added.length)}
          disabled={isAdding}
          className="rounded-xl border border-line bg-white px-6 py-4 text-xs font-bold text-ink transition hover:bg-surface-soft disabled:cursor-not-allowed disabled:border-disabled disabled:text-disabled-text disabled:hover:bg-white"
        >
          {added.length === 0 ? "Skip medical history" : "Finish"}
        </button>
      </div>
    </section>
  );
};

export default MedicalHistoryStep;
