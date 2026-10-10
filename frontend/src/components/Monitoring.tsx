
import { useCallback, useEffect, useRef, useState } from "react";
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

  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState("");
  const [subscriptionError, setSubscriptionError] = useState("");

  const searchInProgress = useRef(false);

  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:3001";

  const searchKnowledge = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim() || searchInProgress.current) {
        return;
      }

      searchInProgress.current = true;
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
        searchInProgress.current = false;
        setIsSearching(false);
      }
    },
    [API_URL]
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    searchKnowledge(query);
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      searchKnowledge("wildfire suppression");
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchKnowledge]);

  async function handleSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || isSubscribing) {
      return;
    }

    setIsSubscribing(true);
    setSubscriptionMessage("");
    setSubscriptionError("");

    try {
      const response = await fetch(`${API_URL}/alerts/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to subscribe to environmental alerts."
        );
      }

      if (data.alreadySubscribe) {
        setSubscriptionMessage(
          "You're already subscribed to environmental alerts."
        );
      } else {
        setSubscriptionMessage(
          "You're subscribed to environmental alerts."
        );
      }

      setEmail("");
    } catch (error) {
      setSubscriptionError(
        error instanceof Error
          ? error.message
          : "Unable to subscribe to environmental alerts."
      );
    } finally {
      setIsSubscribing(false);
    }
  }

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
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--vanara-ember)]">
          Intelligence Workspace
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-[var(--vanara-bone)]">
          Monitoring
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--vanara-ash)]">
          Search and inspect knowledge retrieved from the wildfire
          intelligence system.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0">
          <div className="rounded-2xl border border-[var(--vanara-border)] bg-[var(--vanara-forest)] p-5">
            <div className="mb-4">
              <p className="text-sm font-medium text-[var(--vanara-bone)]">
                Knowledge Activity
              </p>

              <p className="mt-1 text-xs text-[var(--vanara-text-muted)]">
                Vector search across the wildfire knowledge base
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="flex items-center rounded-xl border border-[var(--vanara-border)] bg-[var(--vanara-obsidian)] transition focus-within:border-[var(--vanara-focus)]">
                <span className="pl-4 text-[var(--vanara-ash)]">⌕</span>

                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search the knowledge base..."
                  className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-[var(--vanara-bone)] outline-none placeholder:text-[var(--vanara-ash)]"
                />

                <button
                  type="submit"
                  disabled={isSearching || !query.trim()}
                  className="mr-1.5 rounded-lg bg-[var(--vanara-ember)] px-4 py-2 text-xs font-medium text-[var(--vanara-bone)] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--vanara-focus)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isSearching ? "Searching..." : "Search"}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--vanara-bone)]">
                  Retrieved Knowledge
                </p>

                <p className="mt-1 text-xs text-[var(--vanara-text-muted)]">
                  {hasSearched
                    ? `${results.length} matching chunks retrieved`
                    : "Search the knowledge base to retrieve evidence"}
                </p>
              </div>

              {isSearching && (
                <div className="flex items-center gap-2 text-xs text-[var(--vanara-text-muted)]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--vanara-ember)]" />
                  Searching vector database
                </div>
              )}
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-[var(--vanara-ember)]/40 bg-[var(--vanara-ember)]/10 p-4 text-sm text-[var(--vanara-bone)]"
              >
                {error}
              </div>
            )}

            {!error && hasSearched && results.length === 0 && !isSearching && (
              <div className="rounded-xl border border-[var(--vanara-border)] bg-[var(--vanara-forest)] p-8 text-center">
                <p className="text-sm text-[var(--vanara-ash)]">
                  No matching knowledge was retrieved.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {results.map((result, index) => (
                <article
                  key={`${result.text}-${index}`}
                  className="rounded-xl border border-[var(--vanara-border)] bg-[var(--vanara-forest)] p-5 transition hover:border-[var(--vanara-ash)]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--vanara-ember)]/15 text-xs font-medium text-[var(--vanara-bone)]">
                      {index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-6 text-[var(--vanara-bone)]">
                        {result.text}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-[var(--vanara-text-muted)]">
                          Source
                        </span>

                        {result.url ? (
                          <a
                            href={result.url}
                            target="_blank"
                            rel="noreferrer"
                            className="truncate text-xs text-[var(--vanara-ember)] transition hover:text-[var(--vanara-bone)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--vanara-focus)]"
                          >
                            {getSourceName(result.url)}
                          </a>
                        ) : (
                          <span className="text-xs text-[var(--vanara-text-muted)]">
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

        <div className="rounded-2xl border border-[var(--vanara-border)] bg-[var(--vanara-forest)] p-5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--vanara-ember)]/15 text-[var(--vanara-bone)]">
              !
            </span>

            <div>
              <p className="text-sm font-medium text-[var(--vanara-bone)]">
                Environmental Alerts
              </p>

              <p className="mt-1 text-xs text-[var(--vanara-text-muted)]">
                Get notified when conditions become concerning.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubscribe} className="mt-5">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-xl border border-[var(--vanara-border)] bg-[var(--vanara-obsidian)] px-3 py-3 text-xs text-[var(--vanara-bone)] outline-none placeholder:text-[var(--vanara-ash)] transition focus:border-[var(--vanara-focus)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--vanara-focus)]"
            />

            <button
              type="submit"
              disabled={isSubscribing || !email.trim()}
              className="mt-2 w-full rounded-xl bg-[var(--vanara-ember)] px-4 py-3 text-xs font-medium text-[var(--vanara-bone)] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--vanara-focus)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSubscribing ? "Subscribing..." : "Get Notifications"}
            </button>
          </form>

          {subscriptionMessage && (
            <div
              role="status"
              className="mt-3 rounded-lg border border-[var(--vanara-muted-forest)]/50 bg-[var(--vanara-muted-forest)]/15 p-3 text-xs text-[var(--vanara-bone)]"
            >
              {subscriptionMessage}
            </div>
          )}

          {subscriptionError && (
            <div
              role="alert"
              className="mt-3 rounded-lg border border-[var(--vanara-ember)]/40 bg-[var(--vanara-ember)]/10 p-3 text-xs text-[var(--vanara-bone)]"
            >
              {subscriptionError}
            </div>
          )}
        </div>

        <aside className="h-fit">
          <div className="rounded-2xl border border-[var(--vanara-border)] bg-[var(--vanara-forest)] p-5">
            <p className="text-sm font-medium text-[var(--vanara-bone)]">
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

          <div className="mt-4 rounded-2xl border border-[var(--vanara-border)] bg-[var(--vanara-forest)] p-5">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-[var(--vanara-text-muted)]">
              Current Query
            </p>

            <p className="mt-3 break-words text-sm text-[var(--vanara-bone)]">
              {query || "No query"}
            </p>

            {hasSearched && (
              <p className="mt-3 text-xs text-[var(--vanara-text-muted)]">
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
      <span className="text-xs text-[var(--vanara-ash)]">{label}</span>

      <div className="flex items-center gap-2">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            active
              ? "bg-green-500"
              : "bg-[var(--vanara-ash)]"
          }`}
        />

        <span
          className={`text-xs ${
            active
              ? "text-[var(--vanara-bone)]"
              : "text-[var(--vanara-text-muted)]"
          }`}
        >
          {status}
        </span>
      </div>
    </div>
  );
}

export default Monitoring;
