import axios from "axios";

const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getEmbedding = async (input) => {
  const isBatch = Array.isArray(input);
  const texts = isBatch ? input : [input];

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/embeddings",
        {
          model: process.env.EMBEDDING_MODEL,
          input: texts,
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

      const embeddings = response.data.data
        .sort((a, b) => a.index - b.index)
        .map((item) => item.embedding);

      return isBatch ? embeddings : embeddings[0];
    } catch (error) {
      if (error.response?.status === 429 && attempt < MAX_RETRIES) {
        const delay = INITIAL_DELAY * Math.pow(2, attempt);
        console.log(`Rate limited, retrying in ${delay}ms...`);
        await wait(delay);
        continue;
      }

      console.error("Embedding Error:", error.response?.data || error.message);
      throw new Error("Failed to generate embedding");
    }
  }
};

export default getEmbedding;