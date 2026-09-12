import { useState, useRef, useEffect } from "react";
import Message from "./Message";

const SUGGESTIONS = [
  "What is Amna Iftikhar's most recent experience?",
  "What technologies does she work with?",
  "What projects has she built?",
  "Summarize her education.",
];

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Welcome. I'm a research assistant grounded in Amna Iftikhar's resume and experience. Ask me anything about her background, projects, or skills." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const query = text ?? input;
    if (!query.trim() || loading) return;

    const userMsg = { role: "user", content: query.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      if (!res.ok) {
        throw new Error(data.error || `Request failed with status ${res.status}`);
      }
      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch (err) {
      const serverReachable = err?.message?.startsWith("Request failed");
      const content = serverReachable
        ? `Something went wrong: ${err.message}`
        : "I couldn't reach the server. Please check that the backend is running, then try again.";
      setMessages([...newMessages, { role: "assistant", content }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-ocean-50 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 bg-ocean-300/30 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 w-96 h-96 bg-ocean-200/40 rounded-full blur-3xl" />

      <header className="relative flex items-center justify-between px-6 py-4 sm:px-10 bg-gradient-to-r from-ocean-500 via-ocean-400 to-ocean-500 shadow-ocean-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6M10 8h.01M14 8h.01M9 4h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V6a2 2 0 012-2zM7 16l-3 3M17 16l3 3" />
            </svg>
          </div>
          <div>
            <h1 className="text-white font-semibold text-base tracking-tight">Resume Chat</h1>
            <p className="text-white/70 text-xs">Grounded in the resume · Ask anything</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1.5 border border-white/20">
          <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
          <span className="text-white/80 text-xs font-medium">Assistant ready</span>
        </div>
      </header>

      <div className="relative flex-1 flex flex-col max-w-3xl w-full mx-auto px-4 overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-ocean py-8 px-1 sm:px-2">
          {messages.map((msg, i) => (
            <Message key={i} message={msg} />
          ))}

          {loading && (
            <div className="flex justify-start mb-3 msg-enter">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-ocean-500 to-ocean-400 flex items-center justify-center mr-2.5 mt-1 shadow-ocean-sm">
                <span className="text-white text-xs font-semibold">AI</span>
              </div>
              <div className="bg-white text-ocean-700 px-4 py-3 rounded-2xl rounded-bl-md shadow-ocean-sm border border-ocean-200/60 flex items-center gap-1.5">
                <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-ocean-400 inline-block" />
                <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-ocean-500 inline-block" />
                <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-ocean-600 inline-block" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {messages.length <= 1 && !loading && (
          <div className="pb-4 flex flex-col gap-2.5 msg-enter">
            <p className="text-center text-xs text-ocean-700/60 font-medium">Try asking</p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-sm text-ocean-600 bg-white border border-ocean-200 rounded-full px-4 py-2 transition-all hover:border-ocean-400 hover:bg-ocean-100/50 hover:text-ocean-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean-400 shadow-ocean-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="relative bg-ocean-50/80 backdrop-blur border-t border-ocean-200/60 px-4 sm:px-6 pb-5 pt-4">
        <div className="max-w-3xl w-full mx-auto flex items-end gap-2.5">
          <div className="flex-1 bg-white rounded-2xl border border-ocean-200/70 focus-within:border-ocean-400 focus-within:ring-2 focus-within:ring-ocean-400/30 transition-all shadow-ocean-md px-4 flex items-center">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask about the resume…"
              disabled={loading}
              className="flex-1 bg-transparent py-3.5 text-sm text-ocean-900 placeholder:text-ocean-700/40 focus:outline-none disabled:opacity-60"
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading}
              aria-label="Send message"
              className="flex-shrink-0 w-9 h-9 ml-2 rounded-full bg-gradient-to-br from-ocean-500 to-ocean-600 text-white flex items-center justify-center transition-all hover:from-ocean-400 hover:to-ocean-500 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-ocean-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean-400"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m-7 7l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>
        <p className="max-w-3xl w-full mx-auto mt-2 text-[0.7rem] text-ocean-700/50 text-center">
          Answers are generated from the resume — not a general-knowledge model.
        </p>
      </div>
    </div>
  );
}