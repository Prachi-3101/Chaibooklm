import { useState } from "react";
import StatusBadge from "./StatusBadge.jsx";

const TYPE_ICON = { pdf: "📄", text: "📝", website: "🌐", url: "🌐", youtube: "▶️", vtt: "🗒️" };

export default function SourcesPanel({
  sources,
  selectedIds,
  onToggleSelect,
  onAddFile,
  onAddText,
  onAddUrl,
  onAddYoutube,
  onReindex,
  onDelete,
  onOpenSource,
}) {
  const [tab, setTab] = useState("file");
  const [urlInput, setUrlInput] = useState("");
  const [ytInput, setYtInput] = useState("");
  const [textName, setTextName] = useState("");
  const [textBody, setTextBody] = useState("");

  return (
    <div className="w-full lg:w-80 shrink-0 border-r border-slate-200 bg-white flex flex-col">
      <div className="p-3 border-b border-slate-200">
        <h2 className="font-semibold text-slate-800 mb-2">Add source</h2>
        <div className="flex gap-1 text-xs mb-2 flex-wrap">
          {["file", "text", "url", "youtube"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-2 py-1 rounded ${tab === t ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"}`}
            >
              {t === "file" ? "PDF / VTT" : t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === "file" && (
          <input
            type="file"
            accept=".pdf,.vtt,.txt"
            onChange={(e) => e.target.files[0] && onAddFile(e.target.files[0])}
            className="text-xs w-full"
          />
        )}

        {tab === "text" && (
          <div className="space-y-1">
            <input
              value={textName}
              onChange={(e) => setTextName(e.target.value)}
              placeholder="Title"
              className="w-full text-xs border rounded px-2 py-1"
            />
            <textarea
              value={textBody}
              onChange={(e) => setTextBody(e.target.value)}
              placeholder="Paste text…"
              rows={3}
              className="w-full text-xs border rounded px-2 py-1"
            />
            <button
              onClick={() => {
                if (!textBody.trim()) return;
                onAddText(textName || "Untitled note", textBody);
                setTextName("");
                setTextBody("");
              }}
              className="text-xs px-2 py-1 rounded bg-blue-600 text-white"
            >
              Add text
            </button>
          </div>
        )}

        {tab === "url" && (
          <div className="flex gap-1">
            <input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://…"
              className="flex-1 text-xs border rounded px-2 py-1"
            />
            <button
              onClick={() => {
                if (!urlInput.trim()) return;
                onAddUrl(urlInput.trim());
                setUrlInput("");
              }}
              className="text-xs px-2 py-1 rounded bg-blue-600 text-white"
            >
              Add
            </button>
          </div>
        )}

        {tab === "youtube" && (
          <div className="flex gap-1">
            <input
              value={ytInput}
              onChange={(e) => setYtInput(e.target.value)}
              placeholder="YouTube URL"
              className="flex-1 text-xs border rounded px-2 py-1"
            />
            <button
              onClick={() => {
                if (!ytInput.trim()) return;
                onAddYoutube(ytInput.trim());
                setYtInput("");
              }}
              className="text-xs px-2 py-1 rounded bg-blue-600 text-white"
            >
              Add
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {sources.map((s) => (
          <div key={s.id} className="px-3 py-2 border-b border-slate-100 group">
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={selectedIds.includes(s.id)}
                onChange={() => onToggleSelect(s.id)}
                disabled={s.status !== "ready"}
                className="mt-1 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => onOpenSource(s)}
                  className="text-sm text-left text-slate-800 hover:text-blue-700 truncate block w-full"
                  title={s.name}
                >
                  {TYPE_ICON[s.type] || "📄"} {s.name}
                </button>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={s.status} />
                  {s.status === "ready" && s.num_chunks > 0 && (
                    <span className="text-[11px] text-slate-400">{s.num_chunks} chunks</span>
                  )}
                </div>
                {s.status === "failed" && s.error && (
                  <p className="text-[11px] text-red-600 mt-1 truncate" title={s.error}>{s.error}</p>
                )}
              </div>
              <div className="opacity-0 group-hover:opacity-100 flex flex-col gap-1 text-[11px]">
                <button onClick={() => onReindex(s.id)} className="text-slate-400 hover:text-blue-600">↻</button>
                <button onClick={() => onDelete(s.id)} className="text-slate-400 hover:text-red-600">✕</button>
              </div>
            </div>
          </div>
        ))}
        {sources.length === 0 && (
          <p className="p-4 text-sm text-slate-400">No sources yet. Add a PDF, text, URL, YouTube video, or VTT file above.</p>
        )}
      </div>
    </div>
  );
}