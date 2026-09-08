import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import type { Incident } from "../types/Incident";

import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";

import type { GeoFeature } from "../types/GeoFeature";

type SearchResult = {
  display_name: string;
  lat: string;
  lon: string;
};

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629];

const initialFeatures: GeoFeature[] = [];

function MapClickHandler({
  onSelect,
}: {
  onSelect: (location: LatLng) => void;
}) {
  useMapEvents({
    click(event) {
      onSelect(event.latlng);
    },
  });

  return null;
}

function MapController({
  searchResult,
  selectedIncident,
}: {
  searchResult: SearchResult | null;
  selectedIncident: Incident | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedIncident) {
      map.flyTo(
        [
          selectedIncident.latitude,
          selectedIncident.longitude,
        ],
        10,
        {
          duration: 1.5,
        }
      );

      return;
    }

    if (searchResult) {
      const latitude = Number(searchResult.lat);
      const longitude = Number(searchResult.lon);

      map.flyTo([latitude, longitude], 9, {
        duration: 1.5,
      });
    }
  }, [map, searchResult, selectedIncident]);

  return null;
}

type RiskMapProps = {
  selectedIncident: Incident | null;
};

export default function RiskMap({
  selectedIncident,
}: RiskMapProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] =
    useState<SearchResult | null>(null);
  const [selectedLocation, setSelectedLocation] =
    useState<LatLng | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [features] = useState<GeoFeature[]>(initialFeatures);

  async function searchLocation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query || isSearching) {
      return;
    }

    setIsSearching(true);
    setSearchError("");
    setSearchResult(null);
    setSelectedLocation(null);

    try {
      const params = new URLSearchParams({
        q: query,
        format: "json",
        limit: "1",
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Location search failed");
      }

      const results: SearchResult[] = await response.json();

      if (results.length === 0) {
        setSearchError("Location not found.");
        return;
      }

      setSearchResult(results[0]);
    } catch {
      setSearchError(
        "Unable to search for this location right now."
      );
    } finally {
      setIsSearching(false);
    }
  }

  function handleMapSelection(location: LatLng) {
    setSelectedLocation(location);
    setSearchResult(null);
    setSearchError("");
  }

  return (
    <div className="flex h-full min-h-[calc(100vh-5rem)] flex-col">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-5">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-red-500">
          Geospatial Workspace
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-white">
          Risk Map
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
          Explore geographic locations and prepare the workspace
          for incident and environmental data layers.
        </p>

        {/* Search */}
        <form
          onSubmit={searchLocation}
          className="mt-5 flex w-full max-w-xl gap-2"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
            placeholder="Search location or region"
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-red-500/40"
          />

          <button
            type="submit"
            disabled={isSearching}
            className="rounded-xl bg-red-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </form>

        {searchError && (
          <p className="mt-2 text-xs text-red-400">
            {searchError}
          </p>
        )}
      </div>

      {/* Map */}
      <div className="relative min-h-0 flex-1 p-4 lg:p-6">
        <div className="h-full min-h-[500px] overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f14]">
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={5}
            scrollWheelZoom
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapClickHandler
              onSelect={handleMapSelection}
            />

            <MapController
              searchResult={searchResult}
              selectedIncident={selectedIncident}
            />

            {/* Existing geographic features */}
            {features.map((feature) => (
              <CircleMarker
                key={feature.id}
                center={[
                  feature.latitude,
                  feature.longitude,
                ]}
                radius={7}
              >
                <Popup>
                  <strong>{feature.name}</strong>
                  <br />
                  Type: {feature.type}
                </Popup>
              </CircleMarker>
            ))}

            {selectedIncident && (
              <CircleMarker
                center={[
                  selectedIncident.latitude,
                  selectedIncident.longitude,
                ]}
                radius={11}
              >
                <Popup>
                  <div>
                    <strong>{selectedIncident.title}</strong>

                    <p className="mt-1">
                      Status: {selectedIncident.status}
                    </p>

                    <p className="mt-1">
                      Location: {selectedIncident.location}
                    </p>

                    <p className="mt-1">
                      Coordinates:{" "}
                      {selectedIncident.latitude.toFixed(5)},{" "}
                      {selectedIncident.longitude.toFixed(5)}
                    </p>
                  </div>
                </Popup>
              </CircleMarker>
            )}

            {/* Search result */}
            {searchResult && (
              <CircleMarker
                center={[
                  Number(searchResult.lat),
                  Number(searchResult.lon),
                ]}
                radius={10}
              >
                <Popup>
                  <div>
                    <strong>Location</strong>

                    <p className="mt-1">
                      {searchResult.display_name}
                    </p>

                    <p className="mt-1">
                      Latitude:{" "}
                      {Number(searchResult.lat).toFixed(5)}
                    </p>

                    <p>
                      Longitude:{" "}
                      {Number(searchResult.lon).toFixed(5)}
                    </p>
                  </div>
                </Popup>
              </CircleMarker>
            )}

            {/* Manual map selection */}
            {selectedLocation && (
              <CircleMarker
                center={[
                  selectedLocation.lat,
                  selectedLocation.lng,
                ]}
                radius={8}
              >
                <Popup>
                  <div>
                    <strong>Selected location</strong>

                    <p className="mt-1">
                      Latitude:{" "}
                      {selectedLocation.lat.toFixed(5)}
                    </p>

                    <p>
                      Longitude:{" "}
                      {selectedLocation.lng.toFixed(5)}
                    </p>
                  </div>
                </Popup>
              </CircleMarker>
            )}
          </MapContainer>
        </div>
      </div>

      {/* Layer / status bar */}
      <div className="border-t border-white/10 px-6 py-4">
        <div className="flex flex-wrap gap-6 text-xs text-gray-500">
          <span>● Base map</span>
          <span>○ Incidents</span>
          <span>○ Areas of interest</span>

          {searchResult && (
            <span className="text-gray-300">
              Location: {searchResult.display_name}
            </span>
          )}

          {selectedLocation && (
            <span className="text-gray-300">
              Selected: {selectedLocation.lat.toFixed(4)},{" "}
              {selectedLocation.lng.toFixed(4)}
            </span>
          )}

          {selectedIncident && (
            <span className="text-gray-300">
              Incident: {selectedIncident.title}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}