const STYLES = {
  uploading: "bg-amber-100 text-amber-800",
  indexing: "bg-blue-100 text-blue-800 animate-pulse",
  ready: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

const LABELS = {
  uploading: "Uploading",
  indexing: "Indexing…",
  ready: "Ready",
  failed: "Failed",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STYLES[status] || "bg-slate-100 text-slate-600"}`}>
      {LABELS[status] || status}
    </span>
  );
}
