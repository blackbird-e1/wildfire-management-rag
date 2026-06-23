import { useState } from "react";

import Header from "./components/Header";
import WelcomeScreen from "./components/WelcomeScreen";
import ChatInput from "./components/ChatInput";
import TypingIndicator from "./components/TypingIndicator";

import type { Message } from "./types/Message";

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function sendMessage(message: string) {
    if (!message.trim() || isLoading) {
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3001/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: message,
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong while contacting the server.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="h-screen bg-[#0b0f14] flex flex-col">

      <Header
        hasMessages={messages.length > 0}
        onClear={() => setMessages([])}
      />

      <div className="flex-1 overflow-y-auto">

        {messages.length === 0 ? (
          <WelcomeScreen
            onSuggestion={sendMessage}
          />
        ) : (
          <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">

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
                  className={`max-w-3xl rounded-xl px-4 py-3 whitespace-pre-wrap ${
                    message.role === "user"
                      ? "bg-red-600 text-white"
                      : "bg-[#1a1a1a] text-gray-200"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {isLoading && <TypingIndicator />}

          </div>
        )}

      </div>

      <ChatInput
        onSend={sendMessage}
        isLoading={isLoading}
      />

    </div>
  );
}

export default App;