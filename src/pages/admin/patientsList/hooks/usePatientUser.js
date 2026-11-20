import { useEffect } from "react";

import { usePatientStore } from "../../../../store/patientStore";
import { useUserStore } from "../../../../store/userStore";

/*
  One Patient user (by user id, from the URL) and where they stand:
    "active"   a medical profile exists (GET /Patients)  -> `record`
    "inactive" the backend confirmed a profile that GET /Patients does not list
    "missing"  no medical profile yet
    null       user not found among the Patient users
  Uses the same two lists as the Patients & assignments table, loading them
  when the page is opened directly or refreshed.
*/
export default function usePatientUser(userId) {
  const patientUsers = useUserStore((state) => state.patientUsers);
  const isUsersLoaded = useUserStore((state) => state.isPatientUsersLoaded);
  const usersError = useUserStore((state) => state.patientUsersError);
  const fetchPatientUsers = useUserStore((state) => state.fetchPatientUsers);

  const records = usePatientStore((state) => state.patients);
  const isRecordsLoaded = usePatientStore((state) => state.isLoaded);
  const recordsError = usePatientStore((state) => state.error);
  const fetchPatients = usePatientStore((state) => state.fetchPatients);
  const inactiveProfileUserIds = usePatientStore((state) => state.inactiveProfileUserIds);

  useEffect(() => {
    if (!isUsersLoaded) fetchPatientUsers();
    if (!isRecordsLoaded) fetchPatients();
  }, [isUsersLoaded, isRecordsLoaded, fetchPatientUsers, fetchPatients]);

  const error = usersError ?? recordsError;
  const isLoading = !error && !(isUsersLoaded && isRecordsLoaded);

  const user = patientUsers.find((item) => item.id === userId) ?? null;
  const record = records.find((item) => item.userId === userId) ?? null;

  const profileStatus = !user
    ? null
    : record
      ? "active"
      : inactiveProfileUserIds.includes(userId)
        ? "inactive"
        : "missing";

  const retry = () => {
    fetchPatientUsers();
    fetchPatients();
  };

  return { user, record, profileStatus, isLoading, error, retry };
}
