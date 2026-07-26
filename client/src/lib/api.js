const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function req(path, options = {}) {
  const url = `${BASE}${path}`;
  const headers = options.body instanceof FormData ? {} : { "Content-Type": "application/json" };
  const res = await fetch(url, { ...options, headers });
  const body = await res.json();
  if (!res.ok || body.success === false) {
    throw new Error(body.message || `${res.status}: Request failed`);
  }
  return body;
}

function mapNotebook(nb) {
  return { id: nb._id, name: nb.title, created: nb.createdAt };
}

function mapSource(s) {
  return {
    id: s._id,
    name: s.title,
    type: s.type,
    status: s.status,
    num_chunks: s.chunkCount || 0,
    error: s.error || null,
    origin: s.originalUrl || "",
  };
}

function mapMessage(m) {
  return {
    role: m.role,
    text: m.content,
    citations: (m.citations || []).map((c) => ({
      source_id: c.sourceId,
      chunk_id: c.chunkId,
      chunk: c.chunk,
    })),
  };
}

export const api = {
  // -- Notebooks --
  listNotebooks: async () => {
    const res = await req("/api/notebooks");
    return (res.data || []).map(mapNotebook);
  },

  createNotebook: async (name) => {
    const res = await req("/api/notebooks", {
      method: "POST",
      body: JSON.stringify({ title: name }),
    });
    return mapNotebook(res.data);
  },

  deleteNotebook: async (id) => {
    await req(`/api/notebooks/${id}`, { method: "DELETE" });
  },

  // -- Sources --
  listSources: async (nbId) => {
    const res = await req(`/api/notebooks/${nbId}/sources`);
    return (res.data || []).map(mapSource);
  },

  uploadFile: async (nbId, file) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("notebookId", nbId);
    await req("/api/source/upload", { method: "POST", body: fd });
  },

  addText: async (nbId, title, content) => {
    await req("/api/source/text", {
      method: "POST",
      body: JSON.stringify({ notebookId: nbId, title, content }),
    });
  },

  addUrl: async (nbId, url) => {
    await req("/api/source/upload/website", {
      method: "POST",
      body: JSON.stringify({ notebookId: nbId, url }),
    });
  },

  addYoutube: async (nbId, url) => {
    await req("/api/source/upload/youtube", {
      method: "POST",
      body: JSON.stringify({ notebookId: nbId, url }),
    });
  },

  getSource: async (nbId, sourceId) => {
    const res = await req(`/api/source/${sourceId}`);
    return mapSource(res.data);
  },

  reindexSource: async (nbId, sourceId) => {
    await req(`/api/source/${sourceId}/reindex`, { method: "POST" });
  },

  deleteSource: async (nbId, sourceId) => {
    await req(`/api/source/${sourceId}`, { method: "DELETE" });
  },

  getChunk: async (nbId, sourceId, chunkId) => {
    const res = await req(`/api/source/${sourceId}/chunks/${chunkId}`);
    return res.data;
  },

  // -- Chat --
  query: async (nbId, question, sourceIds) => {
    const res = await req("/api/chat", {
      method: "POST",
      body: JSON.stringify({ notebookId: nbId, question, source_ids: sourceIds ?? null }),
    });
    return {
      answer: res.answer,
      citations: (res.citations || []).map((c) => ({
        ...c,
        marker: c.marker,
      })),
    };
  },

  getChatHistory: async (nbId) => {
    const res = await req(`/api/chat/${nbId}`);
    return (res.data || []).map(mapMessage);
  },

  clearChat: async (nbId) => {
    await req(`/api/chat/${nbId}`, { method: "DELETE" });
  },
};