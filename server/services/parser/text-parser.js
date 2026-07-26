import fs from "fs/promises";

const extractText = async (filePath) => {
  return await fs.readFile(filePath, "utf-8");
};

export default extractText;