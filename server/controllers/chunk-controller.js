import index from "../config/pinecone.js";

export const getChunk = async (req, res) => {
  try {
    const { sourceId, chunkId } = req.params;

    const result = await index.fetch([chunkId]);

    const vector = result.records?.[chunkId];

    if (!vector) {
      return res.status(404).json({
        success: false,
        message: "Chunk not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: chunkId,
        text: vector.metadata?.chunk || "",
        locator: vector.metadata?.locator || "",
      },
    });
  } catch (error) {
    console.error("Get Chunk Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};