import { useEffect, useState, useCallback, useRef } from "react";
import { api } from "./lib/api.js";
import NotebookSidebar from "./components/NotebookSidebar.jsx";
import SourcesPanel from "./components/SourcesPanel.jsx";
import ChatPanel from "./components/ChatPanel.jsx";
import SourceViewer from "./components/SourceViewer.jsx";

export default function App() {
  const [notebooks, setNotebooks] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [sources, setSources] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [messages, setMessages] = useState([]);
  const [viewer, setViewer] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);
  const loadingRef = useRef(false);

  const refreshSources = useCallback(async (nbId) => {
    if (!nbId || loadingRef.current) return;
    try {
      loadingRef.current = true;
      const list = await api.listSources(nbId);
      setSources(list);
      return list;
    } catch (e) {
      console.error("refreshSources error:", e);
      return [];
    } finally {
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    api.listNotebooks()
      .then((nbs) => {
        setNotebooks(nbs);
        if (nbs.length) setActiveId(nbs[0].id);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    setSelectedIds([]);
    setViewer(null);
    setError(null);
    if (activeId) {
      refreshSources(activeId);
      api.getChatHistory(activeId)
        .then(setMessages)
        .catch(() => setMessages([]));
    } else {
      setSources([]);
      setMessages([]);
    }
  }, [activeId, refreshSources]);

  useEffect(() => {
    clearInterval(pollRef.current);
    if (!activeId) return;
    pollRef.current = setInterval(async () => {
      const list = await refreshSources(activeId);
      const stillWorking = list?.some((s) => s.status === "uploading" || s.status === "indexing");
      if (!stillWorking) clearInterval(pollRef.current);
    }, 2000);
    return () => clearInterval(pollRef.current);
  }, [activeId, sources.length, refreshSources]);

  const createNotebook = async (name) => {
    try {
      const nb = await api.createNotebook(name);
      setNotebooks((prev) => [nb, ...prev]);
      setActiveId(nb.id);
      setSidebarOpen(false);
    } catch (e) {
      setError(e.message);
    }
  };

  const deleteNotebook = async (id) => {
    try {
      await api.deleteNotebook(id);
      setNotebooks((prev) => prev.filter((n) => n.id !== id));
      if (activeId === id) setActiveId(null);
    } catch (e) {
      setError(e.message);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const withRefresh = (fn) => async (...args) => {
    try {
      await fn(...args);
      refreshSources(activeId);
    } catch (e) {
      setError(e.message);
    }
  };

  const addFile = withRefresh((file) => api.uploadFile(activeId, file));
  const addText = withRefresh((name, content) => api.addText(activeId, name, content));
  const addUrl = withRefresh((url) => api.addUrl(activeId, url));
  const addYoutube = withRefresh((url) => api.addYoutube(activeId, url));
  const reindex = withRefresh((sourceId) => api.reindexSource(activeId, sourceId));
  const deleteSource = withRefresh((sourceId) => api.deleteSource(activeId, sourceId));

  const ask = async (question) => {
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    try {
      const result = await api.query(activeId, question, selectedIds.length ? selectedIds : null);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: result.answer, citations: result.citations },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: `Error: ${e.message}` },
      ]);
    }
  };

  const clearChat = async () => {
    try {
      await api.clearChat(activeId);
      setMessages([]);
    } catch (e) {
      setError(e.message);
    }
  };

  const openSource = (source) => setViewer({ source, chunkId: null });
  const openCitation = (citation) => {
    const source = sources.find((s) => s.id === citation.source_id);
    setViewer({
      source: source || {
        id: citation.source_id,
        name: citation.source_name,
        type: citation.source_type,
        origin: "",
      },
      chunkId: citation.chunk_id,
    });
  };

  return (
    <div className="h-screen flex relative">
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-3 font-bold">&times;</button>
        </div>
      )}

      <NotebookSidebar
        notebooks={notebooks}
        activeId={activeId}
        onSelect={(id) => { setActiveId(id); setSidebarOpen(false); }}
        onCreate={createNotebook}
        onDelete={deleteNotebook}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
      />

      {activeId ? (
        <>
          <SourcesPanel
            sources={sources}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onAddFile={addFile}
            onAddText={addText}
            onAddUrl={addUrl}
            onAddYoutube={addYoutube}
            onReindex={reindex}
            onDelete={deleteSource}
            onOpenSource={openSource}
          />
          <ChatPanel
            onAsk={ask}
            messages={messages}
            selectedCount={selectedIds.length}
            onCiteClick={openCitation}
            onMenuClick={() => setSidebarOpen(true)}
            onClear={clearChat}
          />
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400">
          Select or create a notebook to get started.
        </div>
      )}

      {viewer && (
        <SourceViewer
          notebookId={activeId}
          source={viewer.source}
          chunkId={viewer.chunkId}
          onClose={() => setViewer(null)}
        />
      )}
    </div>
  );
}