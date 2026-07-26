import { useState } from "react";

export default function NotebookSidebar({ notebooks, activeId, onSelect, onCreate, onDelete, open, onToggle }) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onCreate(name.trim());
    setName("");
    setCreating(false);
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`
          w-64 shrink-0 border-r border-slate-200 bg-white flex flex-col
          fixed lg:static inset-y-0 left-0 z-40
          transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h1 className="font-semibold text-slate-800">Notebooks</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCreating((v) => !v)}
              className="text-sm px-2 py-1 rounded bg-slate-800 text-white hover:bg-slate-700"
            >
              + New
            </button>
            <button onClick={onToggle} className="text-slate-400 hover:text-slate-700 lg:hidden text-lg leading-none">&times;</button>
          </div>
        </div>

        {creating && (
          <form onSubmit={submit} className="p-3 border-b border-slate-200 flex gap-2">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Notebook name"
              className="flex-1 text-sm border rounded px-2 py-1"
            />
            <button className="text-sm px-2 py-1 rounded bg-blue-600 text-white">Add</button>
          </form>
        )}

        <div className="flex-1 overflow-y-auto">
          {notebooks.map((nb) => (
            <div
              key={nb.id}
              onClick={() => onSelect(nb.id)}
              className={`group flex items-center justify-between px-4 py-2 cursor-pointer border-l-4 ${
                nb.id === activeId
                  ? "bg-blue-50 border-blue-600 text-blue-900"
                  : "border-transparent hover:bg-slate-50 text-slate-700"
              }`}
            >
              <span className="truncate text-sm">{nb.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(nb.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-xs text-slate-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          ))}
          {notebooks.length === 0 && (
            <p className="p-4 text-sm text-slate-400">No notebooks yet — create one to get started.</p>
          )}
        </div>
      </aside>
    </>
  );
}