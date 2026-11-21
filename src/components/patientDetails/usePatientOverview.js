import { useEffect } from "react";
import { usePatientOverviewStore } from "../../store/patientOverviewStore";

/*
  GET /Patients/{patientId}/overview for the patient in the URL. Called ONLY by
  the patient details shell (DoctorPatientDetails), which stays mounted while
  the user moves between tabs: the request runs once per patient (again only
  when `patientId` changes or the page is reopened), and the header and the
  tabs all read this one result. A result that belongs to another patient is
  never returned.
*/
export default function usePatientOverview(patientId) {
  const storedPatientId = usePatientOverviewStore((state) => state.patientId);
  const overview = usePatientOverviewStore((state) => state.overview);
  const isLoading = usePatientOverviewStore((state) => state.isLoading);
  const error = usePatientOverviewStore((state) => state.error);
  const fetchOverview = usePatientOverviewStore((state) => state.fetchOverview);

  useEffect(() => {
    if (patientId) fetchOverview(patientId);
  }, [patientId, fetchOverview]);

  const isCurrent = storedPatientId === patientId;

  return {
    overview: isCurrent ? overview : null,
    error: isCurrent ? error : null,
    // Before the effect runs the store may not know this patient yet.
    isLoading: !isCurrent || isLoading,
    retry: () => fetchOverview(patientId),
  };
}
