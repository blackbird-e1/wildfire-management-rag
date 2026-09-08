export type IncidentStatus =
  | "reported"
  | "active"
  | "contained"
  | "closed";

export type Incident = {
  id: string;
  title: string;
  location: string;
  latitude: number;
  longitude: number;
  status: IncidentStatus;
  source: string;
  reportedAt: string;
  description: string;
};