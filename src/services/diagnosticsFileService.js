import api from "./api";
import { toApiError } from "./apiResponse";

/*
  Viewing and downloading diagnostic PDFs:
    GET /Patients/{patientId}/diagnostics/files/{fileId}[?download=true]

  The file URL is protected: it needs the JWT, so it can't be used as a link or
  iframe address. The file is requested through `api` (same base URL, token and
  401 logout as every other call) and handed to the browser as a Blob URL.
*/

const PDF_TYPE = "application/pdf";
const FALLBACK_FILE_NAME = "diagnostic-report.pdf";
const FILE_TIMEOUT_MS = 60_000; // files can take longer than JSON requests

// How long a downloaded file's Blob URL is kept so the browser can read it.
const DOWNLOAD_URL_LIFETIME_MS = 10_000;
// How often an opened report tab is checked, to release its Blob URL once closed.
const TAB_CHECK_MS = 2_000;

// The backend's `fileUrl`. Only this exact shape is requested, so the token is
// never sent to another address.
const FILE_URL_PATTERN =
  /^\/api(\/Patients\/[0-9a-f-]{36}\/diagnostics\/files\/[0-9a-f-]{36})$/i;

// Blob URLs currently shown in the viewer -> their PDF.
const viewerFiles = new Map();
// Blob URLs of reports opened in their own tab -> { tab, timer }.
const reportTabs = new Map();
// Bumped on logout: a file that arrives afterwards is not shown or saved.
let session = 0;

// "/api/Patients/..." -> "/Patients/..." (VITE_API_BASE_URL already ends in /api).
const toRequestPath = (fileUrl) => {
  const match = FILE_URL_PATTERN.exec(fileUrl ?? "");
  if (!match) throw new Error("This report's file address is not valid.");
  return match[1];
};

// A failed Blob request carries the backend's JSON error as a Blob too: read it
// so the user sees its message ("Diagnostic file not found." ...).
const readFileError = async (error) => {
  const response = error?.cause?.response;
  if (!(response?.data instanceof Blob)) return error;

  try {
    const body = JSON.parse(await response.data.text());
    return toApiError({ response: { status: response.status, data: body } });
  } catch {
    return error; // empty or non-JSON body: keep the status-based message
  }
};

const fetchPdf = async (fileUrl, { download = false, signal } = {}) => {
  const path = toRequestPath(fileUrl);
  let data;

  try {
    ({ data } = await api.get(path, {
      responseType: "blob",
      timeout: FILE_TIMEOUT_MS,
      params: download ? { download: true } : undefined,
      signal,
    }));
  } catch (error) {
    throw await readFileError(error);
  }

  // Only a PDF is ever opened from this site's origin.
  if (!(data instanceof Blob) || data.size === 0 || !data.type.startsWith(PDF_TYPE)) {
    throw new Error("The server did not return a PDF file.");
  }

  return data;
};

const toSafeFileName = (fileName) => {
  const name = String(fileName ?? "")
    .replace(/[\\/:*?"<>|]|\p{Cc}/gu, "_")
    .trim();

  if (!name || /^[._]+$/.test(name)) return FALLBACK_FILE_NAME;
  return /\.pdf$/i.test(name) ? name : `${name}.pdf`;
};

/*
  A Blob URL of the PDF, for the in-app viewer. The caller must release it with
  releaseDiagnosticPdfUrl. `signal` cancels the request. Returns null when the
  user signed out while the file was on its way; throws with a message for the
  user.
*/
export const createDiagnosticPdfUrl = async (fileUrl, { signal } = {}) => {
  const requestSession = session;
  const blob = await fetchPdf(fileUrl, { signal });
  if (signal?.aborted || requestSession !== session) return null;

  const url = URL.createObjectURL(blob);
  viewerFiles.set(url, blob);
  return url;
};

export const releaseDiagnosticPdfUrl = (url) => {
  if (viewerFiles.delete(url)) URL.revokeObjectURL(url);
};

const releaseReportTab = (url) => {
  clearInterval(reportTabs.get(url).timer);
  reportTabs.delete(url);
  URL.revokeObjectURL(url);
};

// Closes the tab only while it still shows the report: the user may have gone
// to another page in it.
const closeReportTab = (url, tab) => {
  try {
    const { href } = tab.location;
    if (href === url || href === "about:blank") tab.close();
  } catch {
    // It shows another site now: leave it open.
  }
};

/*
  Opens the report shown in the viewer (`viewerUrl`) in a new browser tab,
  without requesting it again. The tab gets a Blob URL of its own, so closing
  the viewer doesn't affect it; that URL is released once the tab is closed (or
  on logout, which also closes the tab). Must be called directly from a click.
  Throws with a message for the user.
*/
export const openDiagnosticPdfInTab = (viewerUrl) => {
  const blob = viewerFiles.get(viewerUrl);
  if (!blob) {
    throw new Error("This report is no longer loaded. Close it and open it again.");
  }

  const tab = window.open("", "_blank");
  if (!tab) {
    throw new Error(
      "Your browser blocked the new tab. Allow pop-ups for this site and try again.",
    );
  }
  tab.opener = null;

  const url = URL.createObjectURL(blob);
  tab.location.replace(url);

  const timer = setInterval(() => {
    if (tab.closed) releaseReportTab(url);
  }, TAB_CHECK_MS);
  reportTabs.set(url, { tab, timer });
};

// Saves the PDF under its original name. `file`: { fileUrl, fileName }.
export const downloadDiagnosticPdf = async (file) => {
  const requestSession = session;
  const blob = await fetchPdf(file.fileUrl, { download: true });
  if (requestSession !== session) return;

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = toSafeFileName(file.fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), DOWNLOAD_URL_LIFETIME_MS);
};

// Logout: forget every viewed file, close report tabs and ignore pending ones.
export const releaseDiagnosticFiles = () => {
  session += 1;
  [...viewerFiles.keys()].forEach(releaseDiagnosticPdfUrl);

  [...reportTabs].forEach(([url, { tab }]) => {
    closeReportTab(url, tab);
    releaseReportTab(url);
  });
};
