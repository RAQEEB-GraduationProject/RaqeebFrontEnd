import { useEffect, useMemo, useState } from "react";
import { usePatientStore } from "../../../../store/patientStore";

export const RISK_FILTERS = ["Critical", "High", "Medium", "Stable"];

// Explicit clinical priority, highest first (unknown levels go last).
const RISK_PRIORITY = { Critical: 0, High: 1, Medium: 2, Stable: 3 };
const riskRank = (risk) => RISK_PRIORITY[risk] ?? RISK_FILTERS.length;

const byName = (a, b) =>
  a.name.localeCompare(b.name, "en", { sensitivity: "base" });

// Priority queue: by risk, then A–Z inside each risk level.
const byRiskThenName = (a, b) => riskRank(a.risk) - riskRank(b.risk) || byName(a, b);

// Treatment arrives as free text ("Cycle 4 of 8"); the cycle filter only
// applies to patients whose text actually contains a cycle number.
const getCycle = (patient) => {
  const match = /cycle\s+(\d+)/i.exec(patient.treatment ?? "");
  return match ? Number(match[1]) : null;
};

export const TAB_PRIORITY = "priority";
export const TAB_ALL = "all";

const SORTERS = {
  [TAB_PRIORITY]: byRiskThenName,
  [TAB_ALL]: byName,
};

const useDoctorPatients = () => {
  const patients = usePatientStore((state) => state.doctorPatients);
  const isLoading = usePatientStore((state) => state.isDoctorPatientsLoading);
  const error = usePatientStore((state) => state.doctorPatientsError);
  const fetchPatients = usePatientStore((state) => state.fetchDoctorPatients);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const [search, setSearch] = useState("");
  const [risk, setRisk] = useState("all");
  const [cycle, setCycle] = useState("all");
  const [tab, setTab] = useState(TAB_PRIORITY);

  const cycleOptions = useMemo(
    () =>
      [
        ...new Set(patients.map(getCycle).filter(Boolean)),
      ].sort((a, b) => a - b),
    [patients],
  );

  const riskCounts = useMemo(
    () =>
      patients.reduce((counts, p) => {
        if (p.risk) counts[p.risk] = (counts[p.risk] ?? 0) + 1;
        return counts;
      }, {}),
    [patients],
  );

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase();

    return patients
      .filter((p) => {
        if (risk !== "all" && p.risk !== risk) return false;
        if (cycle !== "all" && getCycle(p) !== Number(cycle)) {
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
    isLoading: isLoading && patients.length === 0,
    error: patients.length === 0 ? error : null,
    refetch: fetchPatients,
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
