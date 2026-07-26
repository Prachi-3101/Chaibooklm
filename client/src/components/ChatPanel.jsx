import { useState, useRef, useEffect } from "react";

function AnswerWithCitations({ text, citations, onCiteClick }) {
  const parts = text.split(/(\[\d+\])/g);
  return (
    <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
      {parts.map((part, i) => {
        const m = part.match(/^\[(\d+)\]$/);
        if (m) {
          const n = parseInt(m[1], 10);
          const cite = citations.find((c) => c.marker === n);
          if (cite) {
            return (
              <button
                key={i}
                onClick={() => onCiteClick(cite)}
                className="inline-flex items-center justify-center align-super mx-0.5 text-[10px] font-semibold w-4 h-4 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white"
                title={`${cite.source_name} — click to view source`}
              >
                {n}
              </button>
            );
          }
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}

export default function ChatPanel({ onAsk, messages, selectedCount, onCiteClick, onMenuClick, onClear }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const submit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const q = input.trim();
    setInput("");
    setLoading(true);
    try {
      await onAsk(q);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-w-0">
      {messages.length > 0 && (
        <div className="flex items-center justify-between px-4 lg:px-6 pt-3 pb-0">
          <span className="text-xs text-slate-400">{messages.length} message{messages.length !== 1 ? "s" : ""}</span>
          <button
            onClick={() => { if (confirm("Clear all chat messages?")) onClear(); }}
            className="text-xs text-slate-400 hover:text-red-600"
          >
            Clear chat
          </button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 mt-10 lg:mt-20 text-sm">
            <button onClick={onMenuClick} className="lg:hidden mb-4 text-blue-600 underline">
              Open notebooks
            </button>
            <p>Ask a question grounded in this notebook's sources.</p>
            {selectedCount > 0 && <p className="mt-1">Scoped to {selectedCount} selected source(s).</p>}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-full lg:max-w-2xl rounded-lg px-4 py-3 ${
              m.role === "user" ? "bg-blue-600 text-white" : "bg-white border border-slate-200"
            }`}>
              {m.role === "user" ? (
                <p className="text-sm whitespace-pre-wrap">{m.text}</p>
              ) : (
                <>
                  <AnswerWithCitations text={m.text} citations={m.citations || []} onCiteClick={onCiteClick} />
                  {m.citations && m.citations.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                      {m.citations.map((c) => (
                        <button
                          key={c.marker}
                          onClick={() => onCiteClick(c)}
                          className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
                        >
                          [{c.marker}] {c.source_name}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-400">
              Generating answer…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={submit} className="p-4 border-t border-slate-200 bg-white flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your sources…"
          className="flex-1 border rounded px-3 py-2 text-sm min-w-0"
        />
        <button
          disabled={loading}
          className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          Ask
        </button>
      </form>
    </div>
  );
}