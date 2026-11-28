import { useEffect, useRef, useState } from "react";
import { ExternalLink, X } from "lucide-react";

import {
  createDiagnosticPdfUrl,
  openDiagnosticPdfInTab,
  releaseDiagnosticPdfUrl,
} from "../../../services/diagnosticsFileService";
import getErrorMessage from "../../../utils/getErrorMessage";

const toolbarButtonClass =
  "inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-ink-soft transition hover:bg-surface-soft disabled:cursor-not-allowed disabled:text-disabled-text disabled:hover:bg-transparent";

const Message = ({ role, children }) => (
  <div
    role={role}
    className="flex flex-1 flex-col items-center justify-center px-6 text-center text-sm text-muted-strong"
  >
    {children}
  </div>
);

/*
  Loads the PDF into a Blob URL when `enabled`, and releases it when the viewer
  is removed from the page.
*/
const usePdfUrl = (fileUrl, enabled) => {
  const [result, setResult] = useState({ url: null, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return undefined;

    const controller = new AbortController();
    let url = null;

    createDiagnosticPdfUrl(fileUrl, { signal: controller.signal }).then(
      (created) => {
        // Closed in the meantime.
        if (controller.signal.aborted) return releaseDiagnosticPdfUrl(created);
        url = created;
        setResult({ url, error: null });
      },
      (failure) => {
        if (!controller.signal.aborted) {
          setResult({ url: null, error: getErrorMessage(failure) });
        }
      },
    );

    return () => {
      controller.abort();
      releaseDiagnosticPdfUrl(url);
    };
  }, [fileUrl, enabled, attempt]);

  const retry = () => {
    setResult({ url: null, error: null });
    setAttempt((current) => current + 1);
  };

  return { ...result, retry };
};

// The report in the browser's own PDF viewer, or its loading / error state.
const PdfDocument = ({ url, error, onRetry, title }) => {
  if (error) {
    return (
      <Message role="alert">
        <p className="font-semibold text-ink">Couldn't open the report</p>
        <p className="mt-1">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-accent transition hover:bg-surface-soft"
        >
          Try again
        </button>
      </Message>
    );
  }

  if (!url) return <Message role="status">Loading report…</Message>;

  return <iframe src={url} title={title} className="w-full flex-1 border-0" />;
};

/*
  Large in-app window for the report of one record. A native modal <dialog>:
  the page behind is inert, and Escape closes it. `record`: { fileUrl,
  fileName }. Removing the component (another patient, section or page, or
  logout) releases the PDF; a report opened in its own tab stays available.
*/
const DiagnosticPdfViewer = ({ record, recordName, onClose }) => {
  const dialogRef = useRef(null);
  const [tabError, setTabError] = useState(null);

  // Some browsers (many phones) can't show a PDF inside a page.
  const canShowPdf = navigator.pdfViewerEnabled !== false;
  const { url, error, retry } = usePdfUrl(record.fileUrl, canShowPdf);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal();
  }, []);

  const handleOpenInTab = () => {
    setTabError(null);
    try {
      openDiagnosticPdfInTab(url);
    } catch (failure) {
      setTabError(getErrorMessage(failure));
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-label={`Report: ${recordName}`}
      className="m-auto h-dvh max-h-none w-screen max-w-none overflow-hidden bg-white p-0 text-ink shadow-xl backdrop:bg-overlay/60 sm:h-[92dvh] sm:w-[min(1100px,94vw)] sm:rounded-2xl"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-line-soft px-5 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-medium text-ink">{recordName}</h2>
            <p className="truncate text-xs text-muted-strong">
              {record.fileName ?? "PDF report"}
            </p>
          </div>

          <div className="flex shrink-0 items-stretch gap-2">
            {/* Icon only on narrow screens; the label stays for screen readers. */}
            <button
              type="button"
              onClick={handleOpenInTab}
              disabled={!url}
              title="Open in New Tab"
              className={toolbarButtonClass}
            >
              <ExternalLink size={18} aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">Open in New Tab</span>
            </button>
            <button
              type="button"
              onClick={() => dialogRef.current.close()}
              className={toolbarButtonClass}
            >
              <X size={18} aria-hidden="true" />
              Close
            </button>
          </div>
        </header>

        {tabError && (
          <p
            role="alert"
            className="border-b border-line-soft bg-danger-bg px-5 py-2.5 text-xs font-medium text-danger-text"
          >
            {tabError}
          </p>
        )}

        {canShowPdf ? (
          <PdfDocument
            url={url}
            error={error}
            onRetry={retry}
            title={`Report: ${recordName}`}
          />
        ) : (
          <Message role="status">
            This browser can't display PDF files inside the page. Close this window
            and use Download.
          </Message>
        )}
      </div>
    </dialog>
  );
};

export default DiagnosticPdfViewer;
