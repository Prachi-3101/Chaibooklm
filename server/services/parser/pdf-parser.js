import fs from "fs";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const extractPdfText = async (filePath) => {
  const data = new Uint8Array(fs.readFileSync(filePath));

  const pdf = await getDocument({ data }).promise;

  let text = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);

    const content = await page.getTextContent();

    text += content.items.map(item => item.str).join(" ");
    text += "\n";
  }

  return text;
};

export default extractPdfText;