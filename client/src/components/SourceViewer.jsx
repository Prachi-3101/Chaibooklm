import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

function parseLocator(locator = "") {
  const out = {};
  for (const part of locator.split("|")) {
    const [k, v] = part.split(":");
    out[k] = v;
  }
  return out;
}

export default function SourceViewer({ notebookId, source, chunkId, onClose }) {
  const [chunk, setChunk] = useState(null);

  useEffect(() => {
    if (source && chunkId) {
      api.getChunk(notebookId, source.id, chunkId).then(setChunk).catch(() => setChunk(null));
    } else {
      setChunk(null);
    }
  }, [notebookId, source, chunkId]);

  if (!source) return null;
  const loc = parseLocator(chunk?.locator || "");

  return (
    <div className="fixed inset-0 lg:inset-y-0 lg:right-0 lg:left-auto lg:w-[420px] bg-white border-l border-slate-200 shadow-xl flex flex-col z-40">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-800 truncate max-w-xs lg:max-w-[320px]">{source.name}</h3>
          <p className="text-xs text-slate-400">{source.type.toUpperCase()}</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 ml-2">&times;</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {source.type === "pdf" && (
          <div className="text-sm">
            <p className="text-slate-500 mb-2">
              Cited from <span className="font-medium text-slate-700">page {loc.page || "?"}</span>.
            </p>
            <a
              href={`${source.origin}#page=${loc.page || 1}`}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-xs px-3 py-1.5 rounded bg-blue-600 text-white"
            >
              Open PDF at page {loc.page}
            </a>
          </div>
        )}

        {source.type === "youtube" && (
          <div className="text-sm">
            <p className="text-slate-500 mb-2">
              Cited at <span className="font-medium text-slate-700">{loc.t ? `${Math.floor(loc.t / 60)}:${String(loc.t % 60).padStart(2, "0")}` : "?"}</span>.
            </p>
            <iframe
              className="w-full aspect-video rounded"
              src={`https://www.youtube.com/embed/${extractYtId(source.origin)}?start=${loc.t || 0}`}
              title="YouTube source"
              allowFullScreen
            />
          </div>
        )}

        {source.type === "website" && (
          <div className="text-sm">
            <p className="text-slate-500 mb-2">Cited excerpt from this page:</p>
            <a href={source.origin} target="_blank" rel="noreferrer" className="text-blue-700 underline break-all text-xs">
              {source.origin}
            </a>
          </div>
        )}

        {(source.type === "text" || source.type === "vtt") && chunk?.locator && (
          <p className="text-xs text-slate-400">Locator: {chunk.locator}</p>
        )}

        <div>
          <p className="text-xs font-semibold text-slate-500 mb-1">Cited excerpt</p>
          <div className="text-sm bg-yellow-50 border border-yellow-200 rounded p-3 whitespace-pre-wrap leading-relaxed">
            {chunk ? chunk.text : "Loading…"}
          </div>
        </div>
      </div>
    </div>
  );
}

function extractYtId(urlOrId) {
  const m = urlOrId.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/) || urlOrId.match(/^([0-9A-Za-z_-]{11})$/);
  return m ? m[1] : urlOrId;
}