import { useCallback, useMemo, useState } from "react";
import Swal from "sweetalert2";

import { mockAlerts } from "../../data/mockAlerts";
import { useAuthStore } from "../../store/authStore";
import { enrichAlert, formatClock } from "./alertHelpers";

const toast = (title) =>
  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "success",
    title,
    showConfirmButton: false,
    timer: 2500,
  });

/*
  TEMPORARY, development only. The backend has no alerts, review, resolve or
  notes operations yet, so these actions only change React state (lost on
  reload, never persisted, not scoped to the signed-in user). When an alerts
  API exists, replace this hook's internals with a service/store and keep the
  returned shape so the role pages do not change.

  Review and resolve are separate: review sets `reviewedAt`/`reviewedBy` and
  leaves `status` alone; resolve changes `status` to "Resolved".
*/
export const useLocalAlerts = () => {
  const author = useAuthStore((state) => state.user?.name) ?? "Unknown user";

  const [alerts, setAlerts] = useState(mockAlerts);

  const rows = useMemo(() => alerts.map(enrichAlert), [alerts]);

  const update = useCallback(
    (id, change) =>
      setAlerts((current) =>
        current.map((item) => (item.id === id ? change(item) : item)),
      ),
    [],
  );

  const resolveAlert = useCallback(
    async (alert) => {
      const { isConfirmed } = await Swal.fire({
        title: "Resolve this alert?",
        text: `${alert.id} · ${alert.event} will be marked as resolved.`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Resolve",
        confirmButtonColor: "#0f3d4c",
      });

      if (!isConfirmed) return;

      const time = formatClock(new Date());

      update(alert.id, (item) => ({
        ...item,
        status: "Resolved",
        timeline: [
          ...item.timeline,
          { time, title: "Resolved", detail: `Marked resolved by ${author}` },
        ],
      }));

      toast(`${alert.id} resolved (local only)`);
    },
    [author, update],
  );

  const reviewAlert = useCallback(
    (alert) => {
      if (alert.reviewedAt) return;

      const now = new Date();

      update(alert.id, (item) => ({
        ...item,
        reviewedAt: now.toISOString(),
        reviewedBy: author,
        timeline: [
          ...item.timeline,
          {
            time: formatClock(now),
            title: "Reviewed",
            detail: `Reviewed by ${author}`,
          },
        ],
      }));

      toast(`${alert.id} marked as reviewed (local only)`);
    },
    [author, update],
  );

  const addNote = useCallback(
    (id, text) =>
      update(id, (item) => ({
        ...item,
        notes: [
          ...item.notes,
          { text, author, time: formatClock(new Date()) },
        ],
      })),
    [author, update],
  );

  return { alerts: rows, resolveAlert, reviewAlert, addNote };
};
