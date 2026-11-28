import { useState } from "react";
import { Download, Eye, FileText, Loader2 } from "lucide-react";

import { downloadDiagnosticPdf } from "../../../services/diagnosticsFileService";
import getErrorMessage from "../../../utils/getErrorMessage";
import DiagnosticPdfViewer from "./DiagnosticPdfViewer";

const buttonClass =
  "inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2 text-xs font-semibold text-accent transition hover:bg-surface-soft disabled:cursor-not-allowed disabled:text-muted";

/*
  The attached report of one record: file name, View (in-app viewer) and
  Download. Records without a file have no actions. `recordName` completes the
  button labels.
*/
const DiagnosticFileActions = ({ record, recordName }) => {
  const [isViewing, setIsViewing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState(null);

  if (!record.fileUrl) {
    return <p className="text-xs text-muted">No report attached</p>;
  }

  const handleDownload = async () => {
    setIsDownloading(true);
    setError(null);
    try {
      await downloadDiagnosticPdf(record);
    } catch (failure) {
      setError(getErrorMessage(failure));
    }
    setIsDownloading(false);
  };

  const DownloadIcon = isDownloading ? Loader2 : Download;

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex min-w-0 items-center gap-2 text-xs text-muted-strong">
          <FileText size={16} aria-hidden="true" className="shrink-0" />
          <span className="break-all">{record.fileName ?? "PDF report"}</span>
        </p>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setIsViewing(true)}
            disabled={isDownloading}
            aria-label={`View report: ${recordName}`}
            className={buttonClass}
          >
            <Eye size={14} aria-hidden="true" />
            View
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            aria-label={`Download report: ${recordName}`}
            className={buttonClass}
          >
            <DownloadIcon
              size={14}
              aria-hidden="true"
              className={isDownloading ? "animate-spin" : undefined}
            />
            Download
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-danger-text">
          {error}
        </p>
      )}

      {isViewing && (
        <DiagnosticPdfViewer
          record={record}
          recordName={recordName}
          onClose={() => setIsViewing(false)}
        />
      )}
    </div>
  );
};

export default DiagnosticFileActions;
