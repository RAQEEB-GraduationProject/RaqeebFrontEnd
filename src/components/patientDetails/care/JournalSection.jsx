import { useState } from "react";
import { useParams } from "react-router-dom";

import { useAuthStore } from "../../../store/authStore";
import { canAddPatientCare } from "../../../utils/roles";
import CareDrawer from "./CareDrawer";
import CareSection from "./CareSection";
import JournalEntryForm from "./JournalEntryForm";
import { formatJournalDate, formatJournalFull } from "./patientCareForm";
import usePatientCareList from "./usePatientCareList";

/*
  Patient Care › Journal (reference: screenshot 095728).
  GET /Patients/{patientId}/journal (newest first). Row: entry type, author
  (role) and date; the chevron opens the full content. "At a glance" shows the
  backend's totalCount. "Add entry" only for Admin / Doctor.
*/
const toRow = (entry) => ({
  id: entry.id,
  title: entry.type,
  subtitle: [entry.authorName, entry.authorRole && `(${entry.authorRole})`]
    .filter(Boolean)
    .join(" "),
  badge: formatJournalDate(entry.createdAt),
  details: (
    <>
      <p className="whitespace-pre-line break-words text-sm text-slate-800">{entry.content}</p>
      {formatJournalFull(entry.createdAt) && (
        <p className="mt-2 text-xs text-slate-400">{formatJournalFull(entry.createdAt)}</p>
      )}
    </>
  ),
});

const JournalSection = ({ patientName }) => {
  const { patientId } = useParams();
  const role = useAuthStore((state) => state.user?.role);
  const list = usePatientCareList("journal", patientId);
  const [isAdding, setIsAdding] = useState(false);

  const canAdd = canAddPatientCare(role);

  return (
    <>
      <CareSection
        title="Journal"
        patientName={patientName}
        glanceText="Current journal summary"
        loadingText="Loading journal…"
        errorTitle="Couldn't load the journal"
        emptyText="No journal entries yet."
        list={list}
        rows={(list.items ?? []).map(toRow)}
        canAdd={canAdd}
        onAdd={() => setIsAdding(true)}
      />

      {canAdd && isAdding && (
        <CareDrawer
          eyebrow="Journal"
          label="Add journal entry"
          patientName={patientName}
          onClose={() => setIsAdding(false)}
        >
          <JournalEntryForm
            patientId={patientId}
            onAdded={() => setIsAdding(false)}
            onCancel={() => setIsAdding(false)}
          />
        </CareDrawer>
      )}
    </>
  );
};

export default JournalSection;
