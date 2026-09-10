import { useState } from "react";

type Report = {
  executiveSummary: string;
  keyFindings: string[];
  operationalConsiderations: string[];
};

type Source = {
  text: string;
  url?: string;
};

function Reports() {
  const [query, setQuery] = useState("");
  const [report, setReport] =
    useState<Report | null>(null);
  const [sources, setSources] =
    useState<Source[]>([]);
  const [isGenerating, setIsGenerating] =
    useState(false);
  const [error, setError] = useState("");

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:3001";

  async function generateReport() {
    const trimmedQuery = query.trim();

    if (!trimmedQuery || isGenerating) {
      return;
    }

    setIsGenerating(true);
    setError("");
    setReport(null);
    setSources([]);

    try {
      const response = await fetch(
        `${API_URL}/reports`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: trimmedQuery,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Report request failed"
        );
      }

      const data = await response.json();

      if (
        !data.report ||
        typeof data.report !== "object"
      ) {
        throw new Error(
          "Invalid report response"
        );
      }

      setReport(data.report);

      if (Array.isArray(data.sources)) {
        setSources(data.sources);
      }
    } catch (error) {
      console.error(
        "Report generation failed:",
        error
      );

      setError(
        "Unable to generate the report from the wildfire intelligence server."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    generateReport();
  }

  function buildReportText() {
    if (!report) {
      return "";
    }

    const findings =
      report.keyFindings
        .map(
          (finding) => `• ${finding}`
        )
        .join("\n");

    const considerations =
      report.operationalConsiderations
        .map(
          (consideration) =>
            `• ${consideration}`
        )
        .join("\n");

    const sourceText =
      sources
        .filter(
          (source) =>
            typeof source.url === "string" &&
            source.url.trim().length > 0
        )
        .map(
          (source) => source.url
        )
        .filter(
          (url, index, array) =>
            array.indexOf(url) === index
        )
        .map(
          (url) => `• ${url}`
        )
        .join("\n");

    return `
WILDFIRE INTELLIGENCE REPORT

INVESTIGATION
${query.trim()}

EXECUTIVE SUMMARY
${report.executiveSummary}

KEY FINDINGS
${findings}

OPERATIONAL CONSIDERATIONS
${considerations}

SOURCES
${sourceText || "No source URLs available."}
`.trim();
  }

  function handleCopy() {
    const reportText =
      buildReportText();

    if (!reportText) {
      return;
    }

    navigator.clipboard.writeText(
      reportText
    );
  }

  function handlePrint() {
    if (!report) {
      return;
    }

    window.print();
  }

  const validSources =
    sources.filter(
      (source) =>
        typeof source.url === "string" &&
        source.url.trim().length > 0
    );

  const uniqueSources =
    validSources.filter(
      (source, index, array) =>
        array.findIndex(
          (item) =>
            item.url === source.url
        ) === index
    );

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-8 lg:px-10 lg:py-10">
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-red-500">
          Intelligence Workspace
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-white">
          Intelligence Reports
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
          Generate structured wildfire intelligence reports
          from the underlying knowledge system.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0">
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <div className="mb-5">
              <p className="text-sm font-medium text-white">
                Report Investigation
              </p>

              <p className="mt-1 text-xs text-gray-600">
                Ask the wildfire intelligence system a focused
                question.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <textarea
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Assess wildfire risk considerations for Uttarakhand."
                rows={5}
                className="w-full resize-none rounded-xl border border-white/10 bg-[#080b0f] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-gray-700 transition focus:border-red-500/40"
              />

              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="text-xs text-gray-600">
                  {query.trim()
                    ? `${query.trim().length} characters`
                    : "Enter an investigation question"}
                </p>

                <button
                  type="submit"
                  disabled={
                    isGenerating ||
                    !query.trim()
                  }
                  className="rounded-lg bg-red-600 px-5 py-2.5 text-xs font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isGenerating
                    ? "Generating..."
                    : "Generate Report"}
                </button>
              </div>
            </form>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {isGenerating && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-8">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />

                <div>
                  <p className="text-sm font-medium text-white">
                    Generating intelligence report
                  </p>

                  <p className="mt-1 text-xs text-gray-600">
                    Querying the wildfire knowledge system...
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isGenerating && report && (
            <article className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025]">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-red-500">
                    Report
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Generated from wildfire intelligence
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-400 transition hover:border-white/20 hover:text-white"
                  >
                    Copy Report
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-400 transition hover:border-white/20 hover:text-white"
                  >
                    Print
                  </button>
                </div>
              </div>

              <div className="px-5 py-6">
                <section>
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-red-500">
                    Executive Summary
                  </p>

                  <p className="mt-3 text-sm leading-7 text-gray-300">
                    {report.executiveSummary}
                  </p>
                </section>

                <section className="mt-8">
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-red-500">
                    Key Findings
                  </p>

                  <div className="mt-3 space-y-3">
                    {report.keyFindings.map(
                      (finding, index) => (
                        <div
                          key={index}
                          className="flex gap-3"
                        >
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />

                          <p className="text-sm leading-7 text-gray-300">
                            {finding}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </section>

                <section className="mt-8">
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-red-500">
                    Operational Considerations
                  </p>

                  <div className="mt-3 space-y-3">
                    {report.operationalConsiderations.map(
                      (
                        consideration,
                        index
                      ) => (
                        <div
                          key={index}
                          className="flex gap-3"
                        >
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />

                          <p className="text-sm leading-7 text-gray-300">
                            {consideration}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </section>

                <section className="mt-8 border-t border-white/10 pt-6">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-[0.15em] text-red-500">
                      Sources
                    </p>

                    <p className="text-xs text-gray-600">
                      {uniqueSources.length} source
                      {uniqueSources.length === 1
                        ? ""
                        : "s"}
                    </p>
                  </div>

                  {uniqueSources.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {uniqueSources.map(
                        (source, index) => (
                          <a
                            key={index}
                            href={source.url}
                            target="_blank"
                            rel="noreferrer"
                            className="block rounded-lg border border-white/10 bg-white/[0.02] px-3 py-3 text-xs text-gray-400 transition hover:border-white/20 hover:text-white"
                          >
                            <span className="block truncate">
                              {source.url}
                            </span>
                          </a>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="mt-4 text-xs leading-5 text-gray-600">
                      No source URLs were available for
                      this report.
                    </p>
                  )}
                </section>
              </div>
            </article>
          )}

          {!isGenerating &&
            !report &&
            !error && (
              <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.015] p-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                  ▤
                </div>

                <p className="mt-4 text-sm font-medium text-gray-400">
                  No report generated yet
                </p>

                <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-gray-600">
                  Enter an investigation question above to
                  generate a wildfire intelligence report.
                </p>
              </div>
            )}
        </div>

        <aside className="h-fit">
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <p className="text-sm font-medium text-white">
              Report Pipeline
            </p>

            <div className="mt-5 space-y-4">
              <PipelineRow
                label="Question"
                active={Boolean(
                  query.trim()
                )}
              />

              <PipelineRow
                label="Knowledge retrieval"
                active={
                  isGenerating ||
                  Boolean(report)
                }
              />

              <PipelineRow
                label="Report generation"
                active={
                  isGenerating ||
                  Boolean(report)
                }
              />

              <PipelineRow
                label="Report ready"
                active={Boolean(report)}
              />
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-gray-600">
              Suggested Investigation
            </p>

            <button
              type="button"
              onClick={() =>
                setQuery(
                  "Assess wildfire risk considerations for Uttarakhand."
                )
              }
              className="mt-3 text-left text-sm leading-6 text-gray-400 transition hover:text-white"
            >
              Assess wildfire risk considerations for
              Uttarakhand.
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

function PipelineRow({
  label,
  active,
}: {
  label: string;
  active: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={`text-xs ${
          active
            ? "text-gray-300"
            : "text-gray-600"
        }`}
      >
        {label}
      </span>

      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active
            ? "bg-green-500"
            : "bg-gray-700"
        }`}
      />
    </div>
  );
}

export default Reports;