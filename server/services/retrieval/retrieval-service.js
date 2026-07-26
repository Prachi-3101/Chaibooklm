import index from "../../config/pinecone.js";
import getEmbedding from "../embedding/embedding-service.js";

const retrieveChunks = async (question, notebookId) => {
  // Create embedding for user's question
  const embedding = await getEmbedding(question);

  // Search Pinecone
  const results = await index.query({
    vector: embedding,
    topK: 5,
    includeMetadata: true,
    filter: {
      notebookId: { $eq: notebookId },
    },
  });

  return results.matches || [];
};

export default retrieveChunks;