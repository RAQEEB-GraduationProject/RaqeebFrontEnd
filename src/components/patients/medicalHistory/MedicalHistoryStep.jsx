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
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      <h2 className="text-base font-medium text-[#0b2a3d]">
        Medical history <span className="text-slate-400">(optional)</span>
      </h2>

      <p className="mt-1 text-xs text-slate-400">
        Add diseases, allergies, surgeries or family history for{" "}
        <strong className="font-semibold text-slate-600">{patientName}</strong>, or skip
        this step. Records can also be added later from the patient's details.
      </p>

      {added.length > 0 && (
        <ul aria-label="Records added" className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-100">
          {added.map((entry) => {
            const category = MEDICAL_HISTORY_CATEGORIES.find((item) => item.type === entry.type);
            return (
              <li key={entry.id} className="flex items-start gap-3 px-4 py-3">
                <CircleCheck size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">
                    {category?.singular ?? entry.type}
                    <span className="font-normal text-slate-500">
                      {" · "}
                      {[entry.name, formatHistoryDate(entry.date, { short: true })]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </p>
                  {entry.notes && (
                    <p className="mt-0.5 break-words text-xs text-slate-400">{entry.notes}</p>
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

      <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-200 pt-6">
        <p className="text-xs text-slate-500">
          {added.length === 0
            ? "No records added yet."
            : `${added.length} ${added.length === 1 ? "record" : "records"} added.`}
        </p>

        <button
          type="button"
          onClick={() => onDone(added.length)}
          disabled={isAdding}
          className="rounded-xl border border-slate-200 bg-white px-6 py-4 text-xs font-bold text-[#0b2a3d] transition hover:bg-slate-50 disabled:opacity-60"
        >
          {added.length === 0 ? "Skip medical history" : "Finish"}
        </button>
      </div>
    </section>
  );
};

export default MedicalHistoryStep;
