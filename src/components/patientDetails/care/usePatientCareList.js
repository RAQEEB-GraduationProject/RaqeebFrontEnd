import { useEffect } from "react";
import { usePatientCareStore } from "../../../store/patientCareStore";

/*
  Appointments of the patient in the URL. Requested the first time the section
  is shown for this patient, then kept while the user moves between sections /
  tabs of the same patient (the details page drops it when left, see
  DoctorPatientDetails). A result of another patient is never returned.
*/
export default function usePatientCareList(patientId) {
  const list = usePatientCareStore((state) => state.appointments);
  const fetchList = usePatientCareStore((state) => state.fetchAppointments);

  const isCurrent = list.patientId === patientId;

  useEffect(() => {
    if (patientId && !isCurrent) fetchList(patientId);
  }, [patientId, isCurrent, fetchList]);

  return {
    items: isCurrent ? list.items : null,
    totalCount: isCurrent ? list.totalCount : 0,
    error: isCurrent ? list.error : null,
    // Before the effect runs the store may not know this patient yet.
    isLoading: !isCurrent || list.isLoading,
    retry: () => fetchList(patientId),
  };
}
