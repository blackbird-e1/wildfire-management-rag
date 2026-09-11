import type { Incident } from "../types/Incident";

type IncidentDetailProps = {
  incident: Incident;
  onClose: () => void;
  onViewOnMap?: (incident: Incident) => void;
};

function getStatusLabel(status: Incident["status"]) {
  switch (status) {
    case "reported":
      return "Reported";
    case "active":
      return "Active";
    case "contained":
      return "Contained";
    case "closed":
      return "Closed";
    default:
      return status;
  }
}

function getStatusClasses(status: Incident["status"]) {
  switch (status) {
    case "active":
      return "border-red-500/20 bg-red-500/10 text-red-400";
    case "reported":
      return "border-amber-500/20 bg-amber-500/10 text-amber-400";
    case "contained":
      return "border-blue-500/20 bg-blue-500/10 text-blue-400";
    case "closed":
      return "border-gray-500/20 bg-gray-500/10 text-gray-400";
    default:
      return "border-white/10 bg-white/[0.04] text-gray-400";
  }
}

function formatReportedAt(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function IncidentDetail({
  incident,
  onClose,
  onViewOnMap,
}: IncidentDetailProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="incident-detail-title"
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 px-6 py-5">
          <div className="min-w-0 pr-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-red-500">
              Incident Details
            </p>

            <h2
              id="incident-detail-title"
              className="mt-2 text-xl font-semibold text-white"
            >
              {incident.title}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {incident.location}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close incident details"
            className="shrink-0 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-500 transition hover:bg-white/[0.05] hover:text-white"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 px-6 py-6">
          {/* Status */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-600">
              Status
            </p>

            <span
              className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wider ${getStatusClasses(
                incident.status
              )}`}
            >
              {getStatusLabel(incident.status)}
            </span>
          </div>

          {/* Metadata */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-600">
                Source
              </p>
              <p className="mt-1 text-sm text-gray-300">
                {incident.source}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-600">
                Reported
              </p>
              <p className="mt-1 text-sm text-gray-300">
                {formatReportedAt(incident.reportedAt)}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-600">
                Latitude
              </p>
              <p className="mt-1 font-mono text-sm text-gray-300">
                {incident.latitude.toFixed(6)}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-600">
                Longitude
              </p>
              <p className="mt-1 font-mono text-sm text-gray-300">
                {incident.longitude.toFixed(6)}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-600">
              Description
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-400">
              {incident.description}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-white/10 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-gray-400 transition hover:bg-white/[0.06] hover:text-white"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => onViewOnMap?.(incident)}
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-gray-200"
          >
            View on Map
          </button>
        </div>
      </div>
    </div>
  );
}