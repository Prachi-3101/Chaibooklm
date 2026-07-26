import axios from "axios";

const MAX_CONTEXT_CHARS = 3000;

const chat = async (question, context) => {
  const trimmedContext = context.length > MAX_CONTEXT_CHARS
    ? context.slice(0, MAX_CONTEXT_CHARS) + "\n\n[Context truncated...]"
    : context;

  const userContent = `Context:\n${trimmedContext}\n\nQuestion: ${question}`;

  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: process.env.CHAT_MODEL,
      messages: [
        {
          role: "system",
          content: `You are a helpful research assistant. Answer the user's question based ONLY on the provided context. If the context doesn't contain enough information to answer, say so. Cite relevant sources using [1], [2], etc. corresponding to the numbered citations provided. Keep answers concise and well-structured.`,
        },
        {
          role: "user",
          content: userContent,
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "ChaiBookLM",
      },
    }
  );

  return response.data.choices[0].message.content;
};

export default chat;