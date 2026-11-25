import { useState } from "react";
import { useParams } from "react-router-dom";

import { useAuthStore } from "../../../store/authStore";
import { canAddPatientCare } from "../../../utils/roles";
import AppointmentForm from "./AppointmentForm";
import CareDrawer from "./CareDrawer";
import CareSection from "./CareSection";
import { formatAppointmentWhen } from "./patientCareForm";
import usePatientCareList from "./usePatientCareList";

/*
  Patient Care › Appointments (reference: screenshot 095741).
  GET /Patients/{patientId}/appointments (chronological, all of them). Row:
  title, date · time and provider; the chevron opens the location. "At a
  glance" shows the backend's totalCount. "Add entry" only for Admin / Doctor.
*/
const Detail = ({ label, value }) => (
  <div className="min-w-0">
    <dt className="text-xs text-slate-400">{label}</dt>
    <dd className="mt-0.5 break-words text-sm font-medium text-slate-800">
      {value ?? <span className="font-normal text-slate-400">Not recorded</span>}
    </dd>
  </div>
);

const toRow = (appointment) => ({
  id: appointment.id,
  title: appointment.title,
  subtitle: formatAppointmentWhen(appointment),
  badge: appointment.providerName,
  details: (
    <dl className="grid gap-4 sm:grid-cols-2">
      <Detail label="Provider" value={appointment.providerName} />
      <Detail label="Location" value={appointment.location} />
    </dl>
  ),
});

const AppointmentsSection = ({ patientName }) => {
  const { patientId } = useParams();
  const role = useAuthStore((state) => state.user?.role);
  const list = usePatientCareList("appointments", patientId);
  const [isAdding, setIsAdding] = useState(false);

  const canAdd = canAddPatientCare(role);

  return (
    <>
      <CareSection
        title="Appointments"
        patientName={patientName}
        glanceText="Current appointments summary"
        loadingText="Loading appointments…"
        errorTitle="Couldn't load the appointments"
        emptyText="No appointments yet."
        list={list}
        rows={(list.items ?? []).map(toRow)}
        canAdd={canAdd}
        onAdd={() => setIsAdding(true)}
      />

      {canAdd && isAdding && (
        <CareDrawer
          eyebrow="Appointments"
          label="Add appointment"
          patientName={patientName}
          onClose={() => setIsAdding(false)}
        >
          <AppointmentForm
            patientId={patientId}
            onAdded={() => setIsAdding(false)}
            onCancel={() => setIsAdding(false)}
          />
        </CareDrawer>
      )}
    </>
  );
};

export default AppointmentsSection;
