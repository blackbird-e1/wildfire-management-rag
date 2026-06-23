const SUGGESTIONS = [
  "What are the main causes of wildfires?",
  "How do firefighters stop wildfires?",
  "What weather conditions increase wildfire risk?",
  "Explain controlled burning.",
];

interface WelcomeScreenProps {
  onSuggestion: (text: string) => void;
}

export default function WelcomeScreen({
  onSuggestion,
}: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">

      <div className="mb-10">

        <div className="text-6xl mb-4">
          🔥
        </div>

        <h1 className="text-4xl font-bold text-white">
          Wildfire Management
        </h1>

        <p className="text-gray-500 mt-3">
          AI-powered Retrieval-Augmented Generation for wildfire management.
        </p>

      </div>

      <div className="grid gap-3 max-w-2xl w-full sm:grid-cols-2">

        {SUGGESTIONS.map((item) => (
          <button
            key={item}
            onClick={() => onSuggestion(item)}
            className="text-left p-4 rounded-xl bg-[#1a1a1a] border border-[#2e2e2e] hover:bg-[#242424] hover:border-[#444] transition"
          >
            {item}
          </button>
        ))}

      </div>

    </div>
  );
}