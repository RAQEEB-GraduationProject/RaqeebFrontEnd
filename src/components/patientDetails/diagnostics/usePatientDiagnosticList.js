import { useEffect } from "react";
import { usePatientDiagnosticsStore } from "../../../store/patientDiagnosticsStore";

/*
  Lab results ("labs") or imaging records ("imaging") of the patient in the URL.
  Requested the first time they are shown for this patient. A result that
  belongs to another patient is never returned.
*/
export default function usePatientDiagnosticList(kind, patientId) {
  const list = usePatientDiagnosticsStore((state) => state[kind]);
  const fetchList = usePatientDiagnosticsStore((state) => state.fetchList);

  const isCurrent = list.patientId === patientId;

  useEffect(() => {
    if (patientId && !isCurrent) fetchList(kind, patientId);
  }, [kind, patientId, isCurrent, fetchList]);

  return {
    items: isCurrent ? list.items : null,
    error: isCurrent ? list.error : null,
    // Before the effect runs the store may not know this patient yet.
    isLoading: !isCurrent || list.isLoading,
    retry: () => fetchList(kind, patientId),
  };
}
