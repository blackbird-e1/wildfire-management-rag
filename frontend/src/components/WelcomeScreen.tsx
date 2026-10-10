
import TypingIndicator from "./TypingIndicator";
import type { Message } from "../types/Message";

interface WelcomeScreenProps {
  messages: Message[];
  isLoading: boolean;
  onSend: (message: string) => void;
}

const QUICK_QUESTIONS = [
  "What are the main causes of wildfires?",
  "What weather conditions increase wildfire risk?",
  "How do firefighters stop wildfires?",
  "Explain controlled burning.",
];

export default function WelcomeScreen({
  messages,
  isLoading,
  onSend,
}: WelcomeScreenProps) {
  if (messages.length > 0) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        <div className="space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-3xl rounded-2xl px-5 py-4 whitespace-pre-wrap leading-relaxed ${
                  message.role === "user"
                    ? "bg-[var(--vanara-ember)] text-[var(--vanara-bone)]"
                    : "border border-[var(--vanara-border)] bg-[var(--vanara-forest)] text-[var(--vanara-bone)]"
                }`}
              >
                {message.content}

                {message.role === "assistant" &&
                  message.sources &&
                  message.sources.length > 0 && (
                    <div className="mt-4 border-t border-[var(--vanara-border)] pt-3">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--vanara-text-muted)]">
                        Source{message.sources.length > 1 ? "s" : ""}
                      </p>

                      <div className="mt-2 space-y-1">
                        {Array.from(
                          new Map(
                            message.sources.map((source) => [
                              `${source.source}|${source.sourceType}`,
                              source,
                            ])
                          ).values()
                        ).map((source, sourceIndex) => (
                          <div
                            key={`${source.source}-${sourceIndex}`}
                            className="flex items-center gap-2 text-xs text-[var(--vanara-ash)]"
                          >
                            <span>
                              {source.sourceType === "pdf"
                                ? "📄"
                                : "🔗"}
                            </span>

                            <span>{source.source}</span>

                            <span className="text-[var(--vanara-text-muted)]">
                              · {source.sourceType.toUpperCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          ))}

          {isLoading && <TypingIndicator />}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-[var(--vanara-ember)]">
          Wildfire Intelligence
        </p>

        <h1 className="text-3xl font-semibold tracking-tight text-[var(--vanara-bone)] sm:text-4xl">
          Situational awareness,
          <br />
          powered by AI.
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--vanara-ash)]">
          Search your wildfire knowledge base, investigate
          threats, and turn wildfire information into
          actionable intelligence.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          label="Knowledge Base"
          value="Active"
          description="Astra vector search"
        />

        <DashboardCard
          label="AI Engine"
          value="Online"
          description="Groq inference"
        />

        <DashboardCard
          label="RAG Pipeline"
          value="Ready"
          description="LangGraph workflow"
        />

        <DashboardCard
          label="System"
          value="Operational"
          description="All core services"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <section className="rounded-2xl border border-[var(--vanara-border)] bg-[var(--vanara-forest)] p-6">
          <div className="mb-6">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--vanara-ash)]">
              Quick Analysis
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[var(--vanara-bone)]">
              What would you like to investigate?
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {QUICK_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => onSend(question)}
                className="rounded-xl border border-[var(--vanara-border)] bg-[var(--vanara-obsidian)] p-4 text-left text-sm text-[var(--vanara-bone)] transition hover:border-[var(--vanara-ember)] hover:bg-[var(--vanara-ember)]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--vanara-focus)]"
              >
                {question}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--vanara-border)] bg-[var(--vanara-forest)] p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--vanara-ash)]">
            Architecture
          </p>

          <div className="mt-5 space-y-4">
            <ArchitectureStep
              number="01"
              title="Question"
              description="User intelligence request"
            />

            <ArchitectureStep
              number="02"
              title="LangGraph"
              description="Workflow orchestration"
            />

            <ArchitectureStep
              number="03"
              title="Astra"
              description="Vector retrieval"
            />

            <ArchitectureStep
              number="04"
              title="Groq"
              description="Answer generation"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

interface DashboardCardProps {
  label: string;
  value: string;
  description: string;
}

function DashboardCard({
  label,
  value,
  description,
}: DashboardCardProps) {
  return (
    <div className="rounded-2xl border border-[var(--vanara-border)] bg-[var(--vanara-forest)] p-5">
      <p className="text-xs uppercase tracking-wider text-[var(--vanara-text-muted)]">
        {label}
      </p>

      <p className="mt-3 text-xl font-semibold text-[var(--vanara-bone)]">
        {value}
      </p>

      <p className="mt-1 text-xs text-[var(--vanara-ash)]">
        {description}
      </p>
    </div>
  );
}

interface ArchitectureStepProps {
  number: string;
  title: string;
  description: string;
}

function ArchitectureStep({
  number,
  title,
  description,
}: ArchitectureStepProps) {
  return (
    <div className="flex items-center gap-4">
      <span className="font-mono text-xs text-[var(--vanara-ember)]">
        {number}
      </span>

      <div>
        <p className="text-sm font-medium text-[var(--vanara-bone)]">
          {title}
        </p>

        <p className="text-xs text-[var(--vanara-ash)]">
          {description}
        </p>
      </div>
    </div>
  );
}
