interface HeaderProps {
  onClear: () => void;
  hasMessages: boolean;
}

export default function Header({
  onClear,
  hasMessages,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-[#2e2e2e] bg-[#0f0f0f]">
      <div className="flex items-center gap-3">
        {/* Wildfire Logo */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>

          <div>
            <h1 className="text-white text-lg font-bold leading-none">
              Wildfire Management
            </h1>

            <p className="text-xs text-gray-500">
              RAG Knowledge Assistant
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Status */}
        <div className="hidden md:flex items-center gap-2 text-xs text-gray-400">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Connected
        </div>

        {hasMessages && (
          <button
            onClick={onClear}
            className="text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-[#2e2e2e] hover:border-[#444] hover:bg-[#1b1b1b] cursor-pointer"
          >
            New Chat
          </button>
        )}
      </div>
    </header>
  );
}