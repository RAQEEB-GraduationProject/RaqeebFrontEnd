import { Bell, UserRound, Users } from "lucide-react";

import { PATIENTS_PATH } from "../../pages/admin/patientsList/patientPaths";
import { MIN_QUERY_LENGTH } from "./useAdminSearchData";

// Results shown per category; the rest are reached by typing more.
const RESULT_LIMIT = 5;

// "2026-11-26", "26/11/2026", "26-11-2026" or "26.11.2026".
const DATE_QUERY = /^(\d{4}-\d{1,2}-\d{1,2}|\d{1,2}[/.-]\d{1,2}[/.-]\d{4})$/;

export const isDateQuery = (term) => DATE_QUERY.test(term);

const includes = (value, term) =>
  String(value ?? "")
    .toLowerCase()
    .includes(term);

// Names starting with the term first, then A-Z.
const byRelevance = (term, getName) => (a, b) => {
  const startsA = String(getName(a)).toLowerCase().startsWith(term);
  const startsB = String(getName(b)).toLowerCase().startsWith(term);

  return (
    Number(startsB) - Number(startsA) ||
    String(getName(a)).localeCompare(String(getName(b)), "en", { sensitivity: "base" })
  );
};

const matchPages = (pages, term) =>
  pages
    .filter((page) => [page.label, ...(page.keywords ?? [])].some((text) => includes(text, term)))
    .map((page) => ({ key: page.to, to: page.to, title: page.label, icon: page.icon }));

const matchUsers = (users, term) =>
  users
    .filter((user) => includes(user.userName, term) || includes(user.email, term))
    .sort(byRelevance(term, (user) => user.userName))
    .map((user) => ({
      key: `user-${user.id}`,
      to: `/admin/users/${encodeURIComponent(user.id)}`,
      title: user.userName || "Unnamed User",
      subtitle: [user.role, user.email, !user.isActive && "Inactive"].filter(Boolean).join(" · "),
      icon: UserRound,
    }));

const matchPatients = (patients, term) =>
  patients
    .filter((patient) => includes(patient.name, term) || includes(patient.medicalRecordNumber, term))
    .sort(byRelevance(term, (patient) => patient.name))
    .map((patient) => ({
      key: `patient-${patient.id}`,
      to: `${PATIENTS_PATH}/${encodeURIComponent(patient.id)}`,
      title: patient.name,
      subtitle: [patient.medicalRecordNumber, patient.diagnosis, !patient.isActive && "Inactive"]
        .filter(Boolean)
        .join(" · "),
      icon: Users,
    }));

// A category backed by an API list: loading, failed, or its matches.
const dataGroup = (label, source, match) => {
  if (!source) return { label, items: [], isLoading: true };
  if (source.error) return { label, items: [], error: source.error };

  const matches = match(source.items);

  return { label, items: matches.slice(0, RESULT_LIMIT), total: matches.length };
};

/*
  The dropdown's categories, in display order. A group is
  { label, items, total?, isLoading?, error?, note? }; groups with nothing to
  say are left out. `query` is the raw input text.
*/
export const buildSearchGroups = ({ query, pages, data }) => {
  const term = query.trim().toLowerCase();
  if (!term) return [];

  // There is no alerts API, so alerts cannot be searched by date. Say so rather
  // than showing the development (mock) alerts as results.
  if (isDateQuery(term)) {
    const alertsPage = pages.find((page) => page.to === "/admin/alerts");

    return [
      {
        label: "Alerts",
        note: "Searching alerts by date isn't available yet: the server has no alerts API.",
        items: alertsPage
          ? [{ key: "alerts-page", to: alertsPage.to, title: "Open the Alerts page", icon: Bell }]
          : [],
      },
    ];
  }

  const groups = [{ label: "Pages", items: matchPages(pages, term) }];

  if (term.length >= MIN_QUERY_LENGTH) {
    groups.push(
      dataGroup("Users", data?.users, (users) => matchUsers(users, term)),
      dataGroup("Patients", data?.patients, (patients) => matchPatients(patients, term)),
    );
  }

  return groups.filter((group) => group.items.length > 0 || group.isLoading || group.error);
};
