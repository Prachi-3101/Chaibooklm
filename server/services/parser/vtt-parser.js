import fs from "fs/promises";

const extractVttText = async (filePath) => {
  const data = await fs.readFile(filePath, "utf-8");

  const text = data
    .split("\n")
    .filter((line) => {
      line = line.trim();

      return (
        line &&
        line !== "WEBVTT" &&
        !line.includes("-->") &&
        !/^\d+$/.test(line)
      );
    })
    .join(" ");

  return text;
};

export default extractVttText;