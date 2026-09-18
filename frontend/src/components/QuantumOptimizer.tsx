import { useState } from "react";

type Zone = {
  id: string;
  risk: number;
};

type Deployment = {
  zone: string;
  resource: string;
};

type OptimizationResult = {
  success: boolean;
  objective: number;
  status: string;
  deployment: Deployment[];
};

const INITIAL_ZONES: Zone[] = [
  {
    id: "Zone A",
    risk: 10,
  },
  {
    id: "Zone B",
    risk: 7,
  },
  {
    id: "Zone C",
    risk: 3,
  },
];

function formatResource(resource: string) {
  return resource
    .split("_")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function getResourceIcon(resource: string) {
  if (resource === "fire_engine") {
    return "🚒";
  }

  if (resource === "drone") {
    return "🚁";
  }

  if (resource === "medical_team") {
    return "🏥";
  }

  return "📦";
}

function getRiskLabel(risk: number) {
  if (risk >= 8) {
    return "HIGH";
  }

  if (risk >= 5) {
    return "MEDIUM";
  }

  return "LOW";
}

export default function QuantumOptimizer() {
  const [zones, setZones] = useState<Zone[]>(
    INITIAL_ZONES
  );

  const [result, setResult] =
    useState<OptimizationResult | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState("");

  function updateRisk(index: number, value: number) {
    setZones((currentZones) => {
      const updatedZones = [...currentZones];

      updatedZones[index] = {
        ...updatedZones[index],
        risk: value,
      };

      return updatedZones;
    });
  }

  async function optimizeResources() {
    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const API_URL =
        import.meta.env.VITE_API_URL ||
        "http://localhost:3001";

      const response = await fetch(
        `${API_URL}/quantum/optimize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            zones,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Quantum optimization request failed."
        );
      }

      const data =
        (await response.json()) as OptimizationResult;

      setResult(data);
    } catch (requestError) {
      console.error(requestError);

      setError(
        "Unable to run the quantum optimizer. Make sure the backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8 lg:px-10">

      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">
          Quantum Decision Support
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-white">
          Quantum Resource Optimizer
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
          Allocate limited wildfire response resources
          across high-risk zones using constrained
          binary optimization.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">

          <div className="mb-5">
            <h2 className="text-sm font-semibold text-white">
              Wildfire Zones
            </h2>

            <p className="mt-1 text-xs text-gray-600">
              Adjust the current risk level for each zone.
            </p>
          </div>

          <div className="space-y-3">

            {zones.map((zone, index) => {
              const riskLabel = getRiskLabel(
                zone.risk
              );

              return (
                <div
                  key={zone.id}
                  className="rounded-xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-sm font-medium text-white">
                        {zone.id}
                      </p>

                      <p className="mt-1 text-[11px] text-gray-600">
                        Risk level: {riskLabel}
                      </p>
                    </div>

                    <span className="text-lg font-semibold text-white">
                      {zone.risk}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={zone.risk}
                    onChange={(event) =>
                      updateRisk(
                        index,
                        Number(event.target.value)
                      )
                    }
                    className="mt-4 w-full"
                  />
                </div>
              );
            })}

          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">

            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Available Resources
            </p>

            <div className="mt-4 grid grid-cols-3 gap-3">

              <div>
                <p className="text-lg">🚒</p>
                <p className="mt-1 text-xs text-gray-400">
                  Fire Engines
                </p>
                <p className="text-sm font-semibold text-white">
                  2
                </p>
              </div>

              <div>
                <p className="text-lg">🚁</p>
                <p className="mt-1 text-xs text-gray-400">
                  Drones
                </p>
                <p className="text-sm font-semibold text-white">
                  1
                </p>
              </div>

              <div>
                <p className="text-lg">🏥</p>
                <p className="mt-1 text-xs text-gray-400">
                  Medical Teams
                </p>
                <p className="text-sm font-semibold text-white">
                  1
                </p>
              </div>

            </div>
          </div>

          <button
            type="button"
            onClick={optimizeResources}
            disabled={isLoading}
            className="mt-6 w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading
              ? "Running Quantum Optimizer..."
              : "Optimize Resources"}
          </button>

          {error && (
            <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
              {error}
            </p>
          )}

        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">

          <div className="mb-5">
            <h2 className="text-sm font-semibold text-white">
              Optimization Result
            </h2>

            <p className="mt-1 text-xs text-gray-600">
              Recommended deployment based on the
              current risk distribution.
            </p>
          </div>

          {!result && !isLoading && (
            <div className="flex min-h-[360px] items-center justify-center rounded-xl border border-dashed border-white/10">

              <div className="text-center">

                <div className="text-4xl">
                  ⚛️
                </div>

                <p className="mt-4 text-sm text-gray-500">
                  Run the optimizer to generate a
                  deployment plan.
                </p>

              </div>

            </div>
          )}

          {isLoading && (
            <div className="flex min-h-[360px] items-center justify-center rounded-xl border border-white/10">

              <div className="text-center">

                <div className="text-4xl animate-pulse">
                  ⚛️
                </div>

                <p className="mt-4 text-sm text-gray-400">
                  Solving resource allocation...
                </p>

                <p className="mt-2 text-xs text-gray-600">
                  QUBO → QAOA → Qiskit Aer
                </p>

              </div>

            </div>
          )}

          {result && !isLoading && (
            <div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                      Objective Value
                    </p>

                    <p className="mt-1 text-2xl font-semibold text-white">
                      {result.objective}
                    </p>
                  </div>

                  <div className="rounded-lg bg-green-500/10 px-3 py-2 text-xs font-medium text-green-400">
                    SUCCESS
                  </div>

                </div>

              </div>

              <div className="mt-5">

                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Optimized Allocation
                </p>

                <div className="mt-3 space-y-2">

                  {result.deployment.map(
                    (deployment, index) => (
                      <div
                        key={`${deployment.zone}-${deployment.resource}-${index}`}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                      >

                        <div className="flex items-center gap-3">

                          <span className="text-xl">
                            {getResourceIcon(
                              deployment.resource
                            )}
                          </span>

                          <span className="text-sm text-gray-200">
                            {formatResource(
                              deployment.resource
                            )}
                          </span>

                        </div>

                        <span className="text-xs font-medium text-gray-500">
                          {deployment.zone}
                        </span>

                      </div>
                    )
                  )}

                </div>

              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">

                  <p className="text-[10px] uppercase tracking-wider text-gray-600">
                    Method
                  </p>

                  <p className="mt-1 text-xs text-gray-300">
                    QUBO + QAOA
                  </p>

                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">

                  <p className="text-[10px] uppercase tracking-wider text-gray-600">
                    Simulator
                  </p>

                  <p className="mt-1 text-xs text-gray-300">
                    Qiskit Aer
                  </p>

                </div>

              </div>

            </div>
          )}

        </section>

      </div>
    </div>
  );
}