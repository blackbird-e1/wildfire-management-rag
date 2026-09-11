import { useMemo, useState } from "react";
import type { Incident } from "../types/Incident";
import { INCIDENTS } from "../data/incidents";
import IncidentDetail from "./IncidentDetail";

type IncidentsProps = {
  onViewOnMap?: (incident: Incident) => void;
};

type StatusFilter = "all" | Incident["status"];

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

export default function Incidents({ onViewOnMap }: IncidentsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null
  );
  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredIncidents = useMemo(() => {
    return INCIDENTS.filter((incident) => {
      const matchesStatus =
        statusFilter === "all" || incident.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [
        incident.title,
        incident.location,
        incident.source,
        incident.description,
      ].some((value) => value.toLowerCase().includes(normalizedSearch));
    });
  }, [normalizedSearch, statusFilter]);

  const statusCounts = useMemo(() => {
    return {
      reported: INCIDENTS.filter(
        (incident) => incident.status === "reported"
      ).length,
      active: INCIDENTS.filter((incident) => incident.status === "active")
        .length,
      contained: INCIDENTS.filter(
        (incident) => incident.status === "contained"
      ).length,
      closed: INCIDENTS.filter((incident) => incident.status === "closed")
        .length,
    };
  }, []);

  const filters: {
    value: StatusFilter;
    label: string;
    count: number;
  }[] = [
    {
      value: "all",
      label: "All",
      count: INCIDENTS.length,
    },
    {
      value: "reported",
      label: "Reported",
      count: statusCounts.reported,
    },
    {
      value: "active",
      label: "Active",
      count: statusCounts.active,
    },
    {
      value: "contained",
      label: "Contained",
      count: statusCounts.contained,
    },
    {
      value: "closed",
      label: "Closed",
      count: statusCounts.closed,
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-8 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-red-500">
          Incident Intelligence
        </p>

        <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-semibold text-white">
              Incident Center
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Review known wildfire incidents, operational status, source
              information, and geographic details.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-600">
              Records
            </p>

            <p className="mt-1 text-lg font-semibold text-white">
              {filteredIncidents.length}
            </p>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search incidents..."
              aria-label="Search incidents"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 transition focus:border-white/20"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const isActive = statusFilter === filter.value;

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setStatusFilter(filter.value)}
                  className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
                    isActive
                      ? "border-white/20 bg-white/10 text-white"
                      : "border-white/10 bg-white/[0.02] text-gray-500 hover:bg-white/[0.05] hover:text-gray-300"
                  }`}
                >
                  {filter.label}
                  <span className="ml-1.5 text-gray-600">
                    {filter.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid gap-4">
        {filteredIncidents.map((incident) => (
          <article
            key={incident.id}
            onClick={() => setSelectedIncident(incident)}
            className="cursor-pointer rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-white/15 hover:bg-white/[0.04]"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-semibold text-white">
                    {incident.title}
                  </h2>

                  <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ${getStatusClasses(
                      incident.status
                    )}`}
                  >
                    {getStatusLabel(incident.status)}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-600">
                      Location
                    </p>
                    <p className="mt-1 text-gray-300">{incident.location}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-600">
                      Source
                    </p>
                    <p className="mt-1 text-gray-300">{incident.source}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-600">
                      Reported
                    </p>
                    <p className="mt-1 text-gray-300">
                      {formatReportedAt(incident.reportedAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-600">
                      Coordinates
                    </p>
                    <p className="mt-1 font-mono text-xs text-gray-400">
                      {incident.latitude.toFixed(4)},{" "}
                      {incident.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>

                <p className="mt-5 max-w-3xl text-sm leading-6 text-gray-500">
                  {incident.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onViewOnMap?.(incident)}
                className="shrink-0 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-gray-300 transition hover:bg-white/[0.06] hover:text-white"
              >
                View on Map
              </button>
            </div>
          </article>
        ))}

        {filteredIncidents.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
            <p className="text-sm font-medium text-gray-300">
              No incidents found
            </p>

            <p className="mt-2 text-sm text-gray-600">
              Try changing the search term or status filter.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-gray-400 transition hover:bg-white/[0.06] hover:text-white"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {selectedIncident && (
        <IncidentDetail
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onViewOnMap={(incident) => {
            setSelectedIncident(null);
            onViewOnMap?.(incident);
          }}
        />
      )}
    </div>
  );
}
