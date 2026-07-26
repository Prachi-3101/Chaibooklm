import Source from "../models/source.js";
import indexSource from "../services/indexing/indexSource.js";
import extractWebsite from "../services/parser/website-parser.js";
import extractYoutube from "../services/parser/youtube-parser.js";
import path from "path";

const getFileType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".pdf") return "pdf";
  if (ext === ".vtt") return "vtt";
  return "text";
};

const runIndexing = async (source, opts) => {
  try {
    source.status = "indexing";
    await source.save();

    const chunkCount = await indexSource(opts);

    source.chunkCount = chunkCount;
    source.status = "ready";
    await source.save();
  } catch (error) {
    console.error("Indexing Error:", error);
    source.status = "failed";
    source.error = error.message;
    await source.save();
  }
};

// UNIFIED FILE UPLOAD
export const uploadFile = async (req, res) => {
  try {
    const { notebookId } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const type = getFileType(req.file.originalname);

    const source = await Source.create({
      notebookId,
      title: req.file.originalname,
      type,
      status: "uploading",
      filePath: req.file.path,
    });

    runIndexing(source, {
      type,
      filePath: req.file.path,
      notebookId,
      sourceId: source._id.toString(),
      title: source.title,
    });

    res.status(201).json({
      success: true,
      data: source,
    });
  } catch (error) {
    console.error("Upload File Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// TEXT CONTENT (JSON body)
export const uploadTextContent = async (req, res) => {
  try {
    const { notebookId, title, content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

    const source = await Source.create({
      notebookId,
      title: title || "Untitled note",
      type: "text",
      status: "uploading",
    });

    runIndexing(source, {
      type: "text",
      text: content,
      notebookId,
      sourceId: source._id.toString(),
      title: source.title,
    });

    res.status(201).json({
      success: true,
      data: source,
    });
  } catch (error) {
    console.error("Upload Text Content Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// WEBSITE
export const uploadWebsite = async (req, res) => {
  try {
    const { notebookId, url } = req.body;

    const source = await Source.create({
      notebookId,
      title: url,
      type: "website",
      status: "uploading",
      originalUrl: url,
    });

    runIndexing(source, {
      type: "website",
      text: await extractWebsite(url),
      notebookId,
      sourceId: source._id.toString(),
      title: source.title,
    });

    res.status(201).json({
      success: true,
      data: source,
    });
  } catch (error) {
    console.error("Upload Website Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// YOUTUBE
export const uploadYoutube = async (req, res) => {
  try {
    const { notebookId, url } = req.body;

    const source = await Source.create({
      notebookId,
      title: url,
      type: "youtube",
      status: "uploading",
      originalUrl: url,
    });

    runIndexing(source, {
      type: "youtube",
      text: await extractYoutube(url),
      notebookId,
      sourceId: source._id.toString(),
      title: source.title,
    });

    res.status(201).json({
      success: true,
      data: source,
    });
  } catch (error) {
    console.error("Upload Youtube Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE SOURCE
export const getSource = async (req, res) => {
  try {
    const source = await Source.findById(req.params.id);

    if (!source) {
      return res.status(404).json({
        success: false,
        message: "Source not found",
      });
    }

    res.status(200).json({
      success: true,
      data: source,
    });
  } catch (error) {
    console.error("Get Source Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// REINDEX
export const reindexSource = async (req, res) => {
  try {
    const source = await Source.findById(req.params.id);

    if (!source) {
      return res.status(404).json({
        success: false,
        message: "Source not found",
      });
    }

    const opts = {
      type: source.type,
      notebookId: source.notebookId.toString(),
      sourceId: source._id.toString(),
      title: source.title,
    };

    if (source.filePath) {
      opts.filePath = source.filePath;
    } else if (source.originalUrl && (source.type === "website")) {
      opts.text = await extractWebsite(source.originalUrl);
    } else if (source.originalUrl && (source.type === "youtube")) {
      opts.text = await extractYoutube(source.originalUrl);
    } else {
      return res.status(400).json({
        success: false,
        message: "Cannot reindex: no source content available",
      });
    }

    runIndexing(source, opts);

    res.json({
      success: true,
      data: source,
    });
  } catch (error) {
    console.error("Reindex Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE
export const deleteSource = async (req, res) => {
  try {
    const source = await Source.findById(req.params.id);

    if (!source) {
      return res.status(404).json({
        success: false,
        message: "Source not found",
      });
    }

    await source.deleteOne();

    res.json({
      success: true,
      message: "Source deleted successfully",
    });
  } catch (error) {
    console.error("Delete Source Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};