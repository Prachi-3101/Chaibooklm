import axios from "axios";

const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getEmbedding = async (input, inputType) => {
  const isBatch = Array.isArray(input);
  const texts = isBatch ? input : [input];

  const baseUrl = process.env.EMBEDDING_BASE_URL || "https://openrouter.ai/api/v1";
  const apiKey = process.env.EMBEDDING_API_KEY || process.env.OPENROUTER_API_KEY;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const body = {
        model: process.env.EMBEDDING_MODEL,
        input: texts,
        encoding_format: "float",
        truncate: "NONE",
      };
      if (inputType) body.input_type = inputType;

      const headers = {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      };

      const response = await axios.post(
        `${baseUrl}/embeddings`,
        body,
        { headers }
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
