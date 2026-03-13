"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setError(null);

    const userMsg: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Request failed");
        setLoading(false);
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  return (
    <div className="flex flex-col h-[600px] bg-gray-900/60 rounded-xl border border-purple-500/20 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-purple-500/20 bg-gray-900/80">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          🤖 AI Game Dev Assistant
          <span className="text-xs font-normal text-gray-400">
            Powered by GPT-4o-mini
          </span>
        </h3>
        <p className="text-xs text-gray-500">
          Ask about Shelby Protocol, game dev, Web3 gaming, or Aptos
        </p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🎮</div>
            <p className="text-gray-400 text-sm mb-4">
              Ask me anything about building games on Shelby Protocol!
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "How do I upload a game asset to Shelby?",
                "Best AI model for game NPCs?",
                "Explain the Manual Registration Flow",
                "How to build a leaderboard on Aptos?",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                  }}
                  className="px-3 py-1.5 text-xs bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors border border-gray-700"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-purple-600 text-white rounded-br-sm"
                  : "bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-sm"
              }`}
            >
              {msg.role === "assistant" && (
                <span className="text-purple-400 text-xs font-bold block mb-1">
                  🤖 ShelbyAI
                </span>
              )}
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-400 rounded-xl rounded-bl-sm px-4 py-3 text-sm border border-gray-700">
              <span className="inline-flex gap-1">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>●</span>
                <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>●</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mb-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-xs text-red-400">⚠️ {error}</p>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-purple-500/20 bg-gray-900/80">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about Shelby, game dev, AI models..."
            rows={1}
            className="flex-1 bg-gray-800 text-white text-sm rounded-lg px-4 py-2.5 border border-gray-700 focus:border-purple-500 focus:outline-none resize-none placeholder-gray-500"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
        <p className="text-[10px] text-gray-600 mt-1.5 text-center">
          Uses OpenAI GPT-4o-mini · Responses may not always be accurate
        </p>
      </div>
    </div>
  );
}
