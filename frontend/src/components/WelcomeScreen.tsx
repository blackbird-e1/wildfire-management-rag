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
                    ? "bg-red-600 text-white"
                    : "border border-white/10 bg-white/[0.04] text-gray-200"
                }`}
              >
                {message.content}
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
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-red-500">
          Wildfire Intelligence
        </p>

        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Situational awareness,
          <br />
          powered by AI.
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
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
        <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
          <div className="mb-6">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Quick Analysis
            </p>

            <h2 className="mt-2 text-xl font-semibold text-white">
              What would you like to investigate?
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {QUICK_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => onSend(question)}
                className="rounded-xl border border-white/10 bg-black/20 p-4 text-left text-sm text-gray-300 transition hover:border-red-500/40 hover:bg-white/[0.04] hover:text-white"
              >
                {question}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <p className="text-xs uppercase tracking-wider text-gray-600">
        {label}
      </p>

      <p className="mt-3 text-xl font-semibold text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-500">
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
      <span className="font-mono text-xs text-red-500">
        {number}
      </span>

      <div>
        <p className="text-sm font-medium text-gray-200">
          {title}
        </p>

        <p className="text-xs text-gray-600">
          {description}
        </p>
      </div>
    </div>
  );
}