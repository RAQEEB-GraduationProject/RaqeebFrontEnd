import { useMemo, useState } from "react";
import { mockDoctorPatients } from "../../../../data/mockDoctorPatients";

export const RISK_FILTERS = ["Critical", "High", "Medium", "Stable"];

// Explicit clinical priority, highest first (unknown levels go last).
const RISK_PRIORITY = { Critical: 0, High: 1, Medium: 2, Stable: 3 };
const riskRank = (risk) => RISK_PRIORITY[risk] ?? RISK_FILTERS.length;

const byName = (a, b) =>
  a.name.localeCompare(b.name, "en", { sensitivity: "base" });

// Priority queue: by risk, then A–Z inside each risk level.
const byRiskThenName = (a, b) => riskRank(a.risk) - riskRank(b.risk) || byName(a, b);

export const TAB_PRIORITY = "priority";
export const TAB_ALL = "all";

const SORTERS = {
  [TAB_PRIORITY]: byRiskThenName,
  [TAB_ALL]: byName,
};

const useDoctorPatients = () => {
  // TODO: swap for API data when the backend is ready
  const patients = mockDoctorPatients;

  const [search, setSearch] = useState("");
  const [risk, setRisk] = useState("all");
  const [cycle, setCycle] = useState("all");
  const [tab, setTab] = useState(TAB_PRIORITY);

  const cycleOptions = useMemo(
    () =>
      [
        ...new Set(patients.map((p) => p.treatment?.cycle).filter(Boolean)),
      ].sort((a, b) => a - b),
    [patients],
  );

  const riskCounts = useMemo(
    () =>
      patients.reduce((counts, p) => {
        counts[p.risk] = (counts[p.risk] ?? 0) + 1;
        return counts;
      }, {}),
    [patients],
  );

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase();

    return patients
      .filter((p) => {
        if (risk !== "all" && p.risk !== risk) return false;
        if (cycle !== "all" && p.treatment?.cycle !== Number(cycle)) {
          return false;
        }
        if (!query) return true;
        return (
          p.name.toLowerCase().includes(query) ||
          (p.medicalRecordNumber ?? "").toLowerCase().includes(query)
        );
      })
      .sort(SORTERS[tab]);
  }, [patients, search, risk, cycle, tab]);

  const hasFilters = Boolean(search.trim()) || risk !== "all" || cycle !== "all";

  const clearFilters = () => {
    setSearch("");
    setRisk("all");
    setCycle("all");
  };

  return {
    filteredPatients,
    cycleOptions,
    riskCounts,
    search,
    setSearch,
    risk,
    setRisk,
    cycle,
    setCycle,
    tab,
    setTab,
    hasFilters,
    clearFilters,
  };
};

export default useDoctorPatients;
