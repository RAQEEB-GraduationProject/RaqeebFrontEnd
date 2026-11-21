import { useEffect } from "react";
import { usePatientMedicalHistoryStore } from "../../../store/patientMedicalHistoryStore";

/*
  Medical history of the patient in the URL. Requested the first time the
  Medical History section is shown for this patient, then kept while the
  user moves between sections / tabs of the same patient (the details page
  drops it when left, see DoctorPatientDetails). A result that belongs to
  another patient is never returned.
*/
export default function usePatientMedicalHistory(patientId) {
  const storedPatientId = usePatientMedicalHistoryStore((state) => state.patientId);
  const history = usePatientMedicalHistoryStore((state) => state.history);
  const isLoading = usePatientMedicalHistoryStore((state) => state.isLoading);
  const error = usePatientMedicalHistoryStore((state) => state.error);
  const fetchHistory = usePatientMedicalHistoryStore((state) => state.fetchHistory);

  const isCurrent = storedPatientId === patientId;

  useEffect(() => {
    if (patientId && !isCurrent) fetchHistory(patientId);
  }, [patientId, isCurrent, fetchHistory]);

  return {
    history: isCurrent ? history : null,
    error: isCurrent ? error : null,
    // Before the effect runs the store may not know this patient yet.
    isLoading: !isCurrent || isLoading,
    retry: () => fetchHistory(patientId),
  };
}
