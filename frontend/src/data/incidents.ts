import type { Incident } from "../types/Incident";

export const INCIDENTS: Incident[] = [
  {
    id: "INC-001",
    title: "Development Wildfire Incident",
    location: "Uttarakhand",
    latitude: 30.0668,
    longitude: 79.0193,
    status: "reported",
    source: "Development dataset",
    reportedAt: "2026-09-08T06:30:00Z",
    description:
      "Development incident record used to exercise incident tracking and geographic workflows.",
  },
  {
    id: "INC-002",
    title: "Development Wildfire Incident",
    location: "Himachal Pradesh",
    latitude: 31.1048,
    longitude: 77.1734,
    status: "active",
    source: "Development dataset",
    reportedAt: "2026-09-08T04:15:00Z",
    description:
      "Development incident record used to exercise incident tracking and geographic workflows.",
  },
  {
    id: "INC-003",
    title: "Development Wildfire Incident",
    location: "Karnataka",
    latitude: 15.3173,
    longitude: 75.7139,
    status: "contained",
    source: "Development dataset",
    reportedAt: "2026-09-07T14:45:00Z",
    description:
      "Development incident record used to exercise incident tracking and geographic workflows.",
  },
  {
    id: "INC-004",
    title: "Development Wildfire Incident",
    location: "Odisha",
    latitude: 20.9517,
    longitude: 85.0985,
    status: "closed",
    source: "Development dataset",
    reportedAt: "2026-09-06T09:20:00Z",
    description:
      "Development incident record used to exercise incident tracking and geographic workflows.",
  },
];