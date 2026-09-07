export type GeoFeature = {
  id: string;
  latitude: number;
  longitude: number;
  name: string;
  type: "incident" | "area";
};