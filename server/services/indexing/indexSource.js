import { v4 as uuid } from "uuid";

import extractPdfText from "../parser/pdf-parser.js";
import extractText from "../parser/text-parser.js";

import chunkText from "../../utils/chunkText.js";
import getEmbedding from "../embedding/embedding-service.js";
import extractVttText from "../parser/vtt-parser.js";
import index from "../../config/pinecone.js";

const indexSource = async ({
  type,
  filePath,
  text,
  notebookId,
  sourceId,
  title,
}) => {

  let content = "";

  if (text) {
  content = text;
} else if (type === "pdf") {
  content = await extractPdfText(filePath);
  console.log("====================");
console.log("CONTENT LENGTH:", content.length);
console.log(content.slice(0, 1000));
console.log("====================");
} else if (type === "text") {
  content = await extractText(filePath);
} else if (type === "vtt") {
  content = await extractVttText(filePath);
} else {
  throw new Error(`Unsupported source type: ${type}`);
}

  const chunks = chunkText(content);
  console.log("TOTAL CHUNKS:", chunks.length);
console.log(chunks);

  const embeddings = await getEmbedding(chunks);

  const vectors = chunks.map((chunk, i) => ({
    id: uuid(),
    values: embeddings[i],
    metadata: {
      notebookId,
      sourceId,
      title,
      type,
      chunk,
    },
  }));

  console.log("Vectors:", vectors.length);
  console.log(vectors[0]);
  await index.upsert({
  records: vectors,
});

  return vectors.length;
};

export default indexSource;