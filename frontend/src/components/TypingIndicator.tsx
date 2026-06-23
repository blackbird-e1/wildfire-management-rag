export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 py-2 text-gray-400">
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
    </div>
  );
}