# RAQEEB — Backend API Requirements (derived from the frontend)

**Audience:** backend team. **Status date:** 2026-10-19.

## How to read this document

- **[Derived]** = taken directly from what the current frontend code displays or does.
- **[Proposal]** = a suggested API design. **None of these endpoints exist.** The backend repo (`../backend`) currently contains only Auth, Users, Patients and PatientAssignments controllers — no alerts, review, resolve, note, notification or CTCAE code.
- **[Confirm]** = cannot be determined from the frontend; needs backend/team confirmation.
- Existing conventions the frontend already relies on: base URL `VITE_API_BASE_URL` (ends with `/api`), `Authorization: Bearer <token>`, roles `Admin` / `Doctor` / `Nurse` (frontend lower-cases them), JWT claims for user id, `HospitalId` and role, and GUID ids.
- The frontend currently makes **no** HTTP requests for Alerts or CTCAE rules. Everything below is awaiting API integration.

---

## 1. Alerts (shared feature, three role pages)

### 1.1 Pages and routes

| Role | Route | Frontend file | Status |
|---|---|---|---|
| Admin | `/admin/alerts` | `src/pages/admin/alertsList/AlertsList.jsx` | Implemented on mock data; awaiting API |
| Doctor | `/doctor/alerts` | `src/pages/doctor/doctorAlerts/DoctorAlerts.jsx` | Implemented on mock data; awaiting API |
| Nurse | `/nurse/alerts` | `src/pages/nurse/nurseAlerts/NurseAlerts.jsx` | Implemented on mock data; awaiting API |

Shared UI: `src/components/alerts/` (`AlertsView`, `AlertDetails`, `badges`, `alertHelpers`, `useLocalAlerts`). The mock data is `src/data/mockAlerts.js`. `useLocalAlerts` is the single place to swap for a service/store once the API exists.

### 1.2 Roles and actions [Derived from agreed frontend decisions]

| Action | Admin | Doctor | Nurse |
|---|---|---|---|
| List / filter alerts | all alerts | assigned patients only | assigned patients only |
| View alert details | yes | yes | yes |
| Add internal note | yes | yes | yes |
| Mark as reviewed | **no** (not specified) | yes | yes |
| Resolve | yes | yes | **no** |
| Export CSV | yes | no | no |

The frontend hides buttons per role only for convenience. **The backend must enforce all of this.** Whether Admin may review, and whether Doctor/Nurse may export, are [Confirm].

### 1.3 Data fields the UI consumes [Derived]

Alert object (names are what the frontend uses today; the backend may differ if a mapping is agreed):

| Field | Type | Used for |
|---|---|---|
| `id` | string | Shown as `ALT-4018` (human-readable code). A separate GUID is fine; the UI needs a displayable code. [Confirm format] |
| `createdAt` | ISO 8601 UTC string | "Generated" (shown as `Today · 09:42` or `12 Oct · 09:42`), date filter |
| `patient` | `{ id: guid, name: string }` | Patient column and details subtitle |
| `event` | string | Event column and details title, e.g. `Low SpO₂ · 89%` (free text, can be long) |
| `color` | `"Red" \| "Orange" \| "Yellow" \| "Green"` | Color badge and filter. [Confirm] these are the final severity levels |
| `status` | `"Open" \| "Escalated" \| "Acknowledged" \| "Resolved"` | Status badge and filter. [Confirm] values and meaning (see 1.7) |
| `doctor` | `{ id: guid, name: string } \| null` | Assigned doctor (Admin table column and filter, details subtitle) |
| `responseMinutes` | integer \| null | "Response" column (`8 min`, `1h 12m`). [Confirm] what it measures (creation to first response?) |
| `source` | string | Details: e.g. "Patient daily check-in" |
| `rule` | string | Details: e.g. "CTCAE Dyspnea v4.1". [Confirm] relation to CTCAE rules (see 1.9) |
| `timeline` | array of `{ time, title, detail, tone? }` | "Escalation timeline" in details. `time` is shown as `HH:mm`; the API should send a full timestamp. `tone: "alert"` renders a red dot |
| `notes` | array of `{ text, author, createdAt }` | Internal notes list (author name and time shown) |
| `reviewedAt` | ISO string \| null | "Reviewed" state; disables the review button |
| `reviewedBy` | `{ id, name } \| null` | "Reviewed by …" |

### 1.4 Proposed operations [Proposal — none exist]

**List**

```
GET /api/Alerts?date=2026-10-19&color=Red&status=Open&doctorId={guid}
```

Response `200`:

```json
[
  {
    "id": "ALT-4018",
    "createdAt": "2026-10-19T09:42:00Z",
    "patient": { "id": "…guid…", "name": "Olivia Bennett" },
    "event": "Low SpO₂ · 89%",
    "color": "Red",
    "status": "Open",
    "doctor": { "id": "…guid…", "name": "Emily Harris" },
    "responseMinutes": 8,
    "reviewedAt": null,
    "reviewedBy": null
  }
]
```

**Get by id** (details)

```
GET /api/Alerts/{id}
```

Returns the list fields plus `source`, `rule`, `timeline[]`, `notes[]`:

```json
{
  "id": "ALT-4018",
  "createdAt": "2026-10-19T09:42:00Z",
  "patient": { "id": "…", "name": "Olivia Bennett" },
  "event": "Low SpO₂ · 89%",
  "color": "Red",
  "status": "Open",
  "doctor": { "id": "…", "name": "Emily Harris" },
  "responseMinutes": 8,
  "source": "Patient daily check-in",
  "rule": "CTCAE Dyspnea v4.1",
  "reviewedAt": null,
  "reviewedBy": null,
  "timeline": [
    { "at": "2026-10-19T09:42:00Z", "title": "Alert generated", "detail": "Red threshold detected", "tone": "info" },
    { "at": "2026-10-19T10:00:00Z", "title": "Care team contacted", "detail": "Patient callback initiated", "tone": "alert" }
  ],
  "notes": [
    { "id": "…", "text": "Patient reachable by phone.", "author": { "id": "…", "name": "Jessica Moore" }, "createdAt": "2026-10-19T10:05:00Z" }
  ]
}
```

**Mark as reviewed** (Doctor, Nurse)

```
POST /api/Alerts/{id}/review        body: none
```

Response `200`: the updated alert (or `{ "reviewedAt": "…", "reviewedBy": { … } }`). Must be idempotent or return `409` if already reviewed (the UI disables the button after review). Must **not** change `status` to `Resolved`; whether it changes status at all (e.g. to `Acknowledged`) is [Confirm].

**Resolve** (Admin, Doctor)

```
POST /api/Alerts/{id}/resolve       body: {}   (or { "reason": "…" } if a reason is required)
```

The UI asks for a confirmation dialog first and sends nothing else today. Whether a note/reason is mandatory is [Confirm]. Response `200`: updated alert with `status: "Resolved"` and a new timeline entry. Return `409` if already resolved.

**Add internal note** (Admin, Doctor, Nurse)

```
POST /api/Alerts/{id}/notes
```

```json
{ "text": "Patient reachable by phone." }
```

Response `201`: the created note (`id`, `text`, `author`, `createdAt`). The author must come from the token, not the body. Maximum length and whether notes are editable/deletable are [Confirm] (the UI has no edit/delete).

**Export** (Admin) — the frontend currently builds the CSV in the browser from the already-loaded (filtered) list, columns: Alert, Generated, Patient, Event, Color, Status, Doctor, Response. A server-side export endpoint is only needed if the list becomes paginated: [Confirm].

### 1.5 Filtering, searching, sorting, pagination [Derived]

- Filters in the UI: **date** (single day, local time), **color**, **status**, **doctor** (Admin only). Doctor and Nurse pages show date, color and status.
- The UI currently filters **client-side** over the full loaded list. If the API paginates, it needs server-side filters for those four parameters, plus a total count, so "Showing X of Y" stays correct. [Confirm]
- There is **no search box** and **no sorting control**; rows appear in the order the API returns them. Suggested default: newest first. [Confirm]
- Alert counts shown in the layouts (Admin sidebar badge, Nurse/Doctor dot) are currently hardcoded constants (`OPEN_ALERTS_COUNT = 7` in `AdminLayout.jsx`, `HAS_OPEN_ALERTS` in `NurseLayout.jsx`). An open-alert count endpoint, e.g. `GET /api/Alerts/summary`, would replace them. [Proposal; Confirm]

### 1.6 Authorization and data scoping [Derived requirement; enforcement is backend]

- **Admin:** all alerts of the Admin's hospital (the existing endpoints scope by the `HospitalId` claim). Whether Admin is limited to their hospital is [Confirm]; the frontend adds no restriction.
- **Doctor / Nurse:** only alerts of patients they are actively assigned to. The existing `PatientAssignments` table (`PatientId`, `UserId`, `IsActive`) and the pattern in `PatientAssignmentsController` (non-Admins filtered by `UserId`) are the obvious basis. **The frontend does NOT filter by assignment today**: every mock alert is shown to every role, and the pages display a "Development data" notice saying so. The API must do the scoping; the frontend must not rely on client-side filtering.
- Actions must be authorized per role (see 1.2) and per alert (a Doctor may only review/resolve/annotate alerts in scope). Return `403`/`404` for out-of-scope alerts.
- Caregiver/Patient roles have no alerts UI.

### 1.7 Status lifecycle [Derived — partial]

The frontend knows four statuses: `Open`, `Escalated`, `Acknowledged`, `Resolved`.

- The only transition the frontend performs is **any → Resolved** (via Resolve; the button is disabled once Resolved).
- **Review** is deliberately separate from Resolve: it sets `reviewedAt/reviewedBy` and does not change `status` in the frontend.
- Not determined from the frontend and needing confirmation: how `Escalated` and `Acknowledged` are reached (automatically by time/response rules? by a user action?), whether review should imply `Acknowledged`, whether Resolved alerts can be reopened, and whether a "resolved by / at" must be stored.

### 1.8 Persistence requirements

Review, Resolve and Notes are currently **React state only** (lost on reload; the pages say so in the notice and the toasts say "local only"). The backend must persist:

- Review: who (`reviewedBy`) and when (`reviewedAt`).
- Resolve: who and when, plus the resulting timeline entry, and a reason if required.
- Notes: text, author identity and timestamp, attached to the alert and visible to authorized care-team members. Whether Admin, Doctor and Nurse see each other's notes is [Confirm].
- Timeline entries created by these actions (the UI appends "Reviewed" and "Resolved" entries).

### 1.9 Alert creation and the Rule Engine — OPEN QUESTION

The frontend only **displays** alerts and has no creation UI. **Whether alerts are created automatically (e.g. by a Rule Engine evaluating check-ins, vitals, medication adherence against CTCAE rules) or manually is not known and must be confirmed with the project stakeholders.** The mock records include `source` ("Patient daily check-in", "Wearable device", "Medication schedule") and `rule` (e.g. "CTCAE Dyspnea v4.1"); these are placeholders from the design screenshot and imply, but do not establish, an automatic link to CTCAE rules (section 2). The timeline text "Push and SignalR delivered" in the mock also hints at real-time delivery; real-time delivery (SignalR/push) is not implemented in the frontend and is [Confirm].

### 1.10 UI states the frontend handles

- **Loading:** `AlertsView` accepts `isLoading` (shows "Loading alerts…").
- **Error:** accepts `error` (full-page "Couldn't load alerts" when there is no data, a red banner when stale data exists). Provide readable `message` strings.
- **Empty:** "No alerts yet", or "No alerts match your filters" with a Clear filters button.
- **Action failures:** the frontend should show an error and not update the row; return meaningful `400/403/404/409` messages. (Not wired yet because no API is called.)
- **Validation:** note text must be non-empty (checked client-side); any server limits [Confirm].
- **Long text:** `event` can wrap; no length limit assumed.

### 1.11 Dependencies and open questions (Alerts)

1. Severity set and status set final? (1.3, 1.7)
2. Alert creation mechanism and Rule Engine/CTCAE relationship. (1.9)
3. Does Review change status? May Admin review? May Doctor/Nurse export? Is a resolve reason required?
4. Hospital scoping for Admin. (1.6)
5. Pagination vs. full list; server-side filters; default sort. (1.5)
6. `responseMinutes` definition; alert id format.
7. Real-time delivery of new alerts.
8. What the Doctor "Notifications" page (below) is for.

---

## 2. CTCAE Rules (Admin)

- **Route:** `/admin/ctcae` — `src/pages/admin/ctcaeRules/CtcaeRules.jsx`, data in `src/data/ctcaeRules.js`.
- **Frontend status:** Implemented on local data; awaiting API integration. Changes are React state only (lost on reload).
- **Roles:** Admin (route is under `/admin`). Whether Doctor/Nurse need read access is [Confirm].
- **Data source:** the 103 entries (14 categories) come from `RAQEEB_CTCAE_Full_Chemo_List_Pediatric (2).xlsx` (CTCAE v6.0, MedDRA 28.0), copied verbatim. The backend needs a way to seed/import this list [Confirm].
- **User actions:** list, search (event, category, grades, notes), filter by category / home monitoring / pediatric criteria, view full criteria, add, edit, delete (confirmation dialog).

**Fields [Derived]**

| Field | Type | Notes |
|---|---|---|
| `id` | string/guid | frontend currently uses `ctcae-001…` placeholders |
| `category` | string | 14 values in source; the form allows typing a new category |
| `adverseEvent` | string | required; unique per category (checked client-side) |
| `grade1`…`grade5` | string | required in the form; source uses `N/A` / `-` where undefined; treated as "not defined" |
| `homeMonitoring` | `"Yes" \| "Partial" \| "No"` | |
| `notes` | string | optional |
| `pediatricCriteria` | `"Pediatric-specific" \| "Same as Adult"` | |
| `pediatricNotes` | string | optional |

**Proposals (none exist):**

| Operation | Endpoint |
|---|---|
| List | `GET /api/CtcaeRules` |
| Get | `GET /api/CtcaeRules/{id}` |
| Create | `POST /api/CtcaeRules` |
| Update | `PUT /api/CtcaeRules/{id}` |
| Delete | `DELETE /api/CtcaeRules/{id}` |

Create/Update body = the fields above without `id`:

```json
{
  "category": "<CTCAE category>",
  "adverseEvent": "<adverse event name>",
  "grade1": "<criteria text, or N/A>",
  "grade2": "<criteria text, or N/A>",
  "grade3": "<criteria text, or N/A>",
  "grade4": "<criteria text, or N/A>",
  "grade5": "<criteria text, or N/A>",
  "homeMonitoring": "Yes",
  "notes": "",
  "pediatricCriteria": "Same as Adult",
  "pediatricNotes": ""
}
```

Response: the full rule including `id`; `409` for a duplicate `adverseEvent` in the same category; `400` with field messages for validation errors.

- **Search/filter/pagination:** all client-side over the full list (103 rows shown 25 at a time with "Show more"). Server-side only if the list grows [Confirm].
- **Authorization:** Admin only for create/update/delete [Confirm]. Whether editing is allowed at all (clinical content), and whether versioning/audit ("Version history" appeared in the design screenshot but was not built) is needed: [Confirm].
- **States:** empty ("No rules yet"), no matches (with Clear filters), validation errors inline; no loading/error states exist yet because no API is called.
- **Open questions:** relationship between rules and alert generation (1.9); whether deleting a rule affects existing alerts; versioning.

---

## 3. Other implemented pages that depend on mock data (verified in code)

| Page | Route | Status | Notes |
|---|---|---|---|
| Admin Patients & assignments | `/admin/patients` | Implemented on **mock data** (`mockPatients.js`, `mockStaff.js` via `usePatientAssignments.js`); assign/unassign is local state | The backend **does** have `PatientsController` (list/get/create/update/delete/reactivate) and `PatientAssignmentsController` (create, list, get), but the frontend does not call them. Mapping between the mock shape (numeric ids, `assigned: { doctor, nurse, caregiver }` staff ids, `risk`) and the real DTOs, plus a staff-list source, are [Confirm]. No assignment removal/update endpoint exists. |
| Layout badges | all layouts | Hardcoded placeholders | `OPEN_ALERTS_COUNT` (Admin), `HAS_OPEN_ALERTS` (Nurse), `HAS_UNREAD_NOTIFICATIONS` (Doctor), marked with TODOs. Need counts/flags from the API. |

**Already integrated with the real API** (not a gap): login (`POST /Auth/login`), Admin Users list/details (`GET /Users`, `GET /Users/{id}`) and Add user (`POST /Auth/register`).

**Placeholders with no functionality** (not documented as needing APIs because no requirements exist in the frontend): Doctor Notifications (`/doctor/notifications`, kept separate from Alerts), Doctor dashboard/patients/analytics, Nurse dashboard/patients/check-ins/medications, Admin dashboard/reports/system/profile. These need requirements before API design.
