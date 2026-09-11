import { useEffect, useState } from "react";
import type { FormEvent } from "react";

type SearchResult = {
  text: string;
  url?: string;
};

function Monitoring() {
  const [query, setQuery] = useState("wildfire suppression");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");

  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:3001";

  async function searchKnowledge(searchQuery: string) {
    if (!searchQuery.trim() || isSearching) {
      return;
    }

    setIsSearching(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchQuery.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Search request failed");
      }

      const data = await response.json();

      setResults(data.results || []);
      setHasSearched(true);
    } catch {
      setResults([]);
      setHasSearched(true);
      setError(
        "Unable to retrieve knowledge from the wildfire intelligence server."
      );
    } finally {
      setIsSearching(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    searchKnowledge(query);
  }

  useEffect(() => {
    searchKnowledge("wildfire suppression");
  }, []);

  function getSourceName(url: string | undefined) {
    if (!url) {
      return "Unknown source";
    }

    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-8 lg:px-10 lg:py-10">
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-red-500">
          Intelligence Workspace
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-white">
          Monitoring
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
          Search and inspect knowledge retrieved from the wildfire
          intelligence system.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0">
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <div className="mb-4">
              <p className="text-sm font-medium text-white">
                Knowledge Activity
              </p>

              <p className="mt-1 text-xs text-gray-600">
                Vector search across the wildfire knowledge base
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="flex items-center rounded-xl border border-white/10 bg-[#080b0f] transition focus-within:border-red-500/40">
                <span className="pl-4 text-gray-600">
                  ⌕
                </span>

                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search the knowledge base..."
                  className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-gray-700"
                />

                <button
                  type="submit"
                  disabled={isSearching || !query.trim()}
                  className="mr-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isSearching ? "Searching..." : "Search"}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">
                  Retrieved Knowledge
                </p>

                <p className="mt-1 text-xs text-gray-600">
                  {hasSearched
                    ? `${results.length} matching chunks retrieved`
                    : "Search the knowledge base to retrieve evidence"}
                </p>
              </div>

              {isSearching && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                  Searching vector database
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
                {error}
              </div>
            )}

            {!error && hasSearched && results.length === 0 && !isSearching && (
              <div className="rounded-xl border border-white/10 bg-white/[0.025] p-8 text-center">
                <p className="text-sm text-gray-400">
                  No matching knowledge was retrieved.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {results.map((result, index) => (
                <article
                  key={`${result.text}-${index}`}
                  className="rounded-xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-white/15 hover:bg-white/[0.035]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-xs font-medium text-red-400">
                      {index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-6 text-gray-300">
                        {result.text}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-gray-600">
                          Source
                        </span>

                        {result.url ? (
                          <a
                            href={result.url}
                            target="_blank"
                            rel="noreferrer"
                            className="truncate text-xs text-red-400 transition hover:text-red-300"
                          >
                            {getSourceName(result.url)}
                          </a>
                        ) : (
                          <span className="text-xs text-gray-600">
                            Source unavailable
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <aside className="h-fit">
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <p className="text-sm font-medium text-white">
              System Status
            </p>

            <div className="mt-5 space-y-4">
              <StatusRow
                label="Backend"
                status={hasSearched ? "Connected" : "Checking"}
              />

              <StatusRow
                label="Vector search"
                status={hasSearched ? "Available" : "Checking"}
              />

              <StatusRow
                label="Knowledge base"
                status={
                  results.length > 0
                    ? "Retrieving"
                    : hasSearched
                    ? "Available"
                    : "Checking"
                }
              />
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-gray-600">
              Current Query
            </p>

            <p className="mt-3 break-words text-sm text-gray-300">
              {query || "No query"}
            </p>

            {hasSearched && (
              <p className="mt-3 text-xs text-gray-600">
                {results.length} chunks returned
              </p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

function StatusRow({
  label,
  status,
}: {
  label: string;
  status: string;
}) {
  const active =
    status === "Connected" ||
    status === "Available" ||
    status === "Retrieving";

  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500">
        {label}
      </span>

      <div className="flex items-center gap-2">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            active ? "bg-green-500" : "bg-gray-600"
          }`}
        />

        <span
          className={`text-xs ${
            active ? "text-gray-300" : "text-gray-600"
          }`}
        >
          {status}
        </span>
      </div>
    </div>
  );
}

export default Monitoring;