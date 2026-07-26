import retrieveChunks from "../services/retrieval/retrieval-service.js";
import generateAnswer from "../services/chat/chat-service.js";
import { Chat } from "../models/chat.js";

export const askQuestion = async (req, res) => {
  try {
    const { question, notebookId } = req.body;

    if (!question || !notebookId) {
      return res.status(400).json({
        success: false,
        message: "Question and notebookId are required",
      });
    }

    // Save user message
    let chat = await Chat.findOne({ notebookId });
    if (!chat) {
      chat = await Chat.create({ notebookId, messages: [] });
    }

    chat.messages.push({ role: "user", content: question });
    await chat.save();

    // Retrieve relevant chunks
    const chunks = await retrieveChunks(question, notebookId);

    const context = chunks
      .map((chunk, i) => `[${i + 1}] ${chunk.metadata.chunk}`)
      .join("\n\n");

    // Generate LLM answer
    const answer = await generateAnswer(question, context);

    const citations = chunks.map((chunk, i) => ({
      marker: i + 1,
      source_id: chunk.metadata.sourceId,
      source_name: chunk.metadata.title,
      source_type: chunk.metadata.type || "",
      chunk_id: chunk.id,
      score: chunk.score,
      text: chunk.metadata.chunk,
    }));

    // Save assistant message
    chat.messages.push({
      role: "assistant",
      content: answer,
      citations: citations.map((c) => ({
        sourceId: c.source_id,
        chunkId: c.chunk_id,
        chunk: c.text,
      })),
    });
    await chat.save();

    res.json({
      success: true,
      answer,
      citations,
    });
  } catch (err) {
    console.error("Chat Error:", err.response?.data || err.message);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const clearChat = async (req, res) => {
  try {
    const { notebookId } = req.params;

    const chat = await Chat.findOne({ notebookId });

    if (!chat) {
      return res.json({
        success: true,
        message: "Chat already empty",
      });
    }

    chat.messages = [];
    await chat.save();

    res.json({
      success: true,
      message: "Chat cleared",
    });
  } catch (err) {
    console.error("Clear Chat Error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const { notebookId } = req.params;

    const chat = await Chat.findOne({ notebookId });

    if (!chat) {
      return res.json({
        success: true,
        data: [],
      });
    }

    res.json({
      success: true,
      data: chat.messages,
    });
  } catch (err) {
    console.error("Get Chat History Error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};