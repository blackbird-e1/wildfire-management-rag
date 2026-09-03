import { useState } from "react";

import Header from "./components/Header";
import WelcomeScreen from "./components/WelcomeScreen";
import WelcomeAnimation from "./components/WelcomeAnimation";
import ChatInput from "./components/ChatInput";

import type { Message } from "./types/Message";

type View =
  | "overview"
  | "monitoring"
  | "risk"
  | "incidents"
  | "reports";

const NAV_ITEMS: {
  id: View;
  label: string;
  icon: string;
}[] = [
  { id: "overview", label: "Overview", icon: "⌂" },
  { id: "monitoring", label: "Monitoring", icon: "◉" },
  { id: "risk", label: "Risk Map", icon: "⌁" },
  { id: "incidents", label: "Incidents", icon: "!" },
  { id: "reports", label: "Reports", icon: "▤" },
];

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<View>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function sendMessage(message: string) {
    if (!message.trim() || isLoading) {
      return;
    }

    setActiveView("overview");
    setSidebarOpen(false);

    const userMessage: Message = {
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:3001";

      const response = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: message,
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content:
          data.answer ||
          "The system did not return an answer.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Something went wrong while contacting the wildfire intelligence server.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleNavigation(view: View) {
    setActiveView(view);
    setSidebarOpen(false);
  }

  function clearChat() {
    setMessages([]);
    setActiveView("overview");
  }

  function renderPlaceholder(
    title: string,
    description: string
  ) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-6">
        <div className="max-w-xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-2xl text-red-500">
            ◉
          </div>

          <p className="text-xs font-medium uppercase tracking-[0.2em] text-red-500">
            Module
          </p>

          <h1 className="mt-3 text-3xl font-semibold text-white">
            {title}
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            {description}
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-gray-500">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
            Module ready for integration
          </div>
        </div>
      </div>
    );
  }

  function renderMainContent() {
    switch (activeView) {
      case "overview":
        return (
          <WelcomeScreen
            messages={messages}
            isLoading={isLoading}
            onSend={sendMessage}
          />
        );

      case "monitoring":
        return renderPlaceholder(
          "Wildfire Monitoring",
          "A dedicated monitoring workspace for tracking wildfire activity, environmental signals, and incoming intelligence."
        );

      case "risk":
        return renderPlaceholder(
          "Risk Map",
          "A geospatial risk workspace for visualizing wildfire-prone regions and future external data layers."
        );

      case "incidents":
        return renderPlaceholder(
          "Incident Center",
          "A centralized workspace for wildfire incidents, response information, and operational status."
        );

      case "reports":
        return renderPlaceholder(
          "Intelligence Reports",
          "Generate and review structured wildfire intelligence reports from the underlying knowledge system."
        );

      default:
        return (
          <WelcomeScreen
            messages={messages}
            isLoading={isLoading}
            onSend={sendMessage}
          />
        );
    }
  }

  return (
    <div className="relative min-h-screen bg-[#080b0f] text-white">
      <WelcomeAnimation />

      <div className="flex min-h-screen">
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/10 bg-[#0b0f14] transition-transform duration-200 lg:static lg:translate-x-0 ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
        >
          <div className="flex h-20 items-center border-b border-white/10 px-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-lg">
              🔥
            </div>

            <div className="ml-3">
              <p className="text-sm font-semibold text-white">
                Wildfire
              </p>

              <p className="text-xs text-gray-500">
                Intelligence Platform
              </p>
            </div>
          </div>

          <nav className="flex-1 px-3 py-6">
            <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
              Workspace
            </p>

            <div className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const active = activeView === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      handleNavigation(item.id)
                    }
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                      active
                        ? "bg-red-500/10 text-white"
                        : "text-gray-500 hover:bg-white/[0.04] hover:text-gray-200"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm ${
                        active
                          ? "bg-red-500/15 text-red-400"
                          : "bg-white/[0.03] text-gray-600"
                      }`}
                    >
                      {item.icon}
                    </span>

                    <span>{item.label}</span>

                    {active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-red-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-white/10 p-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />

                <span className="text-xs font-medium text-gray-300">
                  System operational
                </span>
              </div>

              <p className="mt-2 text-[11px] leading-5 text-gray-600">
                RAG services are connected and ready.
              </p>
            </div>
          </div>
        </aside>

        <main className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Header
            hasMessages={messages.length > 0}
            onClear={clearChat}
          />

          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center border-b border-white/5 px-4 py-3 lg:hidden">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-400 hover:text-white"
              >
                Menu
              </button>

              <span className="ml-3 text-sm text-gray-500">
                {getViewLabel(activeView)}
              </span>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {renderMainContent()}
            </div>

            {activeView === "overview" && (
              <ChatInput
                onSend={sendMessage}
                isLoading={isLoading}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function getViewLabel(view: View) {
  const item = NAV_ITEMS.find((navItem) => navItem.id === view);

  if (item) {
    return item.label;
  }

  return "Overview";
}

export default App;