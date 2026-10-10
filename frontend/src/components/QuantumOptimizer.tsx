
import { useState } from "react";

type RiskZone = {
  id: string;
  risk: number;
};

type QuantumOptimizerProps = {
  zones: RiskZone[];
  onRiskChange: (zoneId: string, risk: number) => void;
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

function formatResource(resource: string) {
  return resource
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
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

function getRiskClasses(risk: number) {
  if (risk >= 8) {
    return "text-red-400";
  }

  if (risk >= 5) {
    return "text-amber-400";
  }

  return "text-[var(--vanara-muted-forest)]";
}

function getOptimizationExplanation(
  zones: RiskZone[],
  deployment: Deployment[]
) {
  if (zones.length === 0) {
    return "No wildfire zones were provided for optimization.";
  }

  const highestRiskZone = zones.reduce((highest, zone) => {
    if (zone.risk > highest.risk) {
      return zone;
    }

    return highest;
  });

  const resourcesForHighestRisk = deployment.filter(
    (item) => item.zone === highestRiskZone.id
  );

  if (resourcesForHighestRisk.length > 0) {
    const resources = resourcesForHighestRisk.map((item) =>
      formatResource(item.resource)
    );

    let resourceText = resources[0];

    if (resources.length > 1) {
      resourceText = `${resources.slice(0, -1).join(", ")} and ${
        resources[resources.length - 1]
      }`;
    }

    return `${highestRiskZone.id} has the highest current risk at ${highestRiskZone.risk}/10. The optimizer assigned ${resourceText} to this zone while satisfying the available resource constraints.`;
  }

  return `${highestRiskZone.id} has the highest current risk at ${highestRiskZone.risk}/10. The optimizer produced a deployment plan based on the current risk distribution and resource constraints.`;
}

export default function QuantumOptimizer({
  zones,
  onRiskChange,
}: QuantumOptimizerProps) {
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  function updateRisk(zoneId: string, value: number) {
    onRiskChange(zoneId, value);
  }

  async function optimizeResources() {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:3001";

      const response = await fetch(`${API_URL}/quantum/optimize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          zones,
        }),
      });

      if (!response.ok) {
        throw new Error("Quantum optimization request failed.");
      }

      const data = (await response.json()) as OptimizationResult;

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
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--vanara-ember)]">
          Quantum Decision Support
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-[var(--vanara-bone)]">
          Quantum Resource Optimizer
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--vanara-ash)]">
          Allocate limited wildfire response resources across high-risk
          zones using constrained binary optimization.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[var(--vanara-border)] bg-[var(--vanara-forest)] p-6">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-[var(--vanara-bone)]">
              Wildfire Zones
            </h2>

            <p className="mt-1 text-xs text-[var(--vanara-text-muted)]">
              Adjust the current risk level for each zone.
            </p>
          </div>

          <div className="space-y-3">
            {zones.map((zone) => {
              const riskLabel = getRiskLabel(zone.risk);

              return (
                <div
                  key={zone.id}
                  className="rounded-xl border border-[var(--vanara-border)] bg-[var(--vanara-obsidian)] p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[var(--vanara-bone)]">
                        {zone.id}
                      </p>

                      <p
                        className={`mt-1 text-[11px] ${getRiskClasses(
                          zone.risk
                        )}`}
                      >
                        Risk level: {riskLabel}
                      </p>
                    </div>

                    <span className="text-lg font-semibold text-[var(--vanara-bone)]">
                      {zone.risk}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={zone.risk}
                    onChange={(event) =>
                      updateRisk(zone.id, Number(event.target.value))
                    }
                    aria-label={`Risk level for ${zone.id}`}
                    className="mt-4 w-full cursor-pointer accent-[var(--vanara-ember)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--vanara-focus)]"
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-xl border border-[var(--vanara-border)] bg-[var(--vanara-obsidian)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--vanara-text-muted)]">
              Available Resources
            </p>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div>
                <p className="text-lg">🚒</p>
                <p className="mt-1 text-xs text-[var(--vanara-ash)]">
                  Fire Engines
                </p>
                <p className="text-sm font-semibold text-[var(--vanara-bone)]">
                  2
                </p>
              </div>

              <div>
                <p className="text-lg">🚁</p>
                <p className="mt-1 text-xs text-[var(--vanara-ash)]">
                  Drones
                </p>
                <p className="text-sm font-semibold text-[var(--vanara-bone)]">
                  1
                </p>
              </div>

              <div>
                <p className="text-lg">🏥</p>
                <p className="mt-1 text-xs text-[var(--vanara-ash)]">
                  Medical Teams
                </p>
                <p className="text-sm font-semibold text-[var(--vanara-bone)]">
                  1
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={optimizeResources}
            disabled={isLoading}
            className="mt-6 w-full rounded-xl bg-[var(--vanara-ember)] px-4 py-3 text-sm font-semibold text-[var(--vanara-bone)] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--vanara-focus)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading
              ? "Running Quantum Optimizer..."
              : "Optimize Resources"}
          </button>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-[var(--vanara-ember)]/40 bg-[var(--vanara-ember)]/10 p-3 text-xs text-[var(--vanara-bone)]"
            >
              {error}
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-[var(--vanara-border)] bg-[var(--vanara-forest)] p-6">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-[var(--vanara-bone)]">
              Optimization Result
            </h2>

            <p className="mt-1 text-xs text-[var(--vanara-text-muted)]">
              Recommended deployment based on the current risk distribution.
            </p>
          </div>

          {!result && !isLoading && (
            <div className="flex min-h-[360px] items-center justify-center rounded-xl border border-dashed border-[var(--vanara-border)]">
              <div className="text-center">
                <div className="text-4xl">⚛️</div>

                <p className="mt-4 text-sm text-[var(--vanara-ash)]">
                  Run the optimizer to generate a deployment plan.
                </p>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex min-h-[360px] items-center justify-center rounded-xl border border-[var(--vanara-border)]">
              <div className="text-center">
                <div className="animate-pulse text-4xl">⚛️</div>

                <p className="mt-4 text-sm text-[var(--vanara-ash)]">
                  Solving resource allocation...
                </p>

                <p className="mt-2 text-xs text-[var(--vanara-text-muted)]">
                  QUBO → QAOA → Qiskit Aer
                </p>
              </div>
            </div>
          )}

          {result && !isLoading && (
            <div>
              <div className="rounded-xl border border-[var(--vanara-border)] bg-[var(--vanara-obsidian)] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--vanara-text-muted)]">
                      Objective Value
                    </p>

                    <p className="mt-1 text-2xl font-semibold text-[var(--vanara-bone)]">
                      {result.objective}
                    </p>
                  </div>

                  <div className="rounded-lg border border-[var(--vanara-muted-forest)]/50 bg-[var(--vanara-muted-forest)]/15 px-3 py-2 text-xs font-medium text-[var(--vanara-bone)]">
                    {result.success ? "SUCCESS" : result.status}
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--vanara-text-muted)]">
                  Optimized Allocation
                </p>

                <div className="mt-3 space-y-2">
                  {result.deployment.map((deployment, index) => (
                    <div
                      key={`${deployment.zone}-${deployment.resource}-${index}`}
                      className="flex items-center justify-between rounded-xl border border-[var(--vanara-border)] bg-[var(--vanara-obsidian)] px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                          {getResourceIcon(deployment.resource)}
                        </span>

                        <span className="text-sm text-[var(--vanara-bone)]">
                          {formatResource(deployment.resource)}
                        </span>
                      </div>

                      <span className="text-xs font-medium text-[var(--vanara-ash)]">
                        {deployment.zone}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-[var(--vanara-border)] bg-[var(--vanara-obsidian)] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--vanara-text-muted)]">
                  Decision Explanation
                </p>

                <p className="mt-2 text-xs leading-5 text-[var(--vanara-ash)]">
                  {getOptimizationExplanation(zones, result.deployment)}
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[var(--vanara-border)] bg-[var(--vanara-obsidian)] p-4">
                  <p className="text-[10px] uppercase tracking-wider text-[var(--vanara-text-muted)]">
                    Method
                  </p>

                  <p className="mt-1 text-xs text-[var(--vanara-bone)]">
                    QUBO + QAOA
                  </p>
                </div>

                <div className="rounded-xl border border-[var(--vanara-border)] bg-[var(--vanara-obsidian)] p-4">
                  <p className="text-[10px] uppercase tracking-wider text-[var(--vanara-text-muted)]">
                    Simulator
                  </p>

                  <p className="mt-1 text-xs text-[var(--vanara-bone)]">
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
