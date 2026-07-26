import index from "../../config/pinecone.js";
const storeChunks = async (vectors) => {
  await index.upsert(vectors);
};

export default storeChunks;