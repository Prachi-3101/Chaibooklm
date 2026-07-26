import express from "express";
import upload from "../middleware/upload.js";

import {
  uploadFile,
  uploadTextContent,
  uploadWebsite,
  uploadYoutube,
  getSource,
  reindexSource,
  deleteSource,
} from "../controllers/source-controller.js";
import { getChunk } from "../controllers/chunk-controller.js";

const router = express.Router();

// Unified file upload (detects type from extension)
router.post("/upload", upload.single("file"), uploadFile);

// Text content via JSON body
router.post("/text", uploadTextContent);

// Website
router.post("/upload/website", uploadWebsite);

// Youtube
router.post("/upload/youtube", uploadYoutube);

// Get single source
router.get("/:id", getSource);

// Get chunk from source
router.get("/:sourceId/chunks/:chunkId", getChunk);

// Reindex Source
router.post("/:id/reindex", reindexSource);

// Delete Source
router.delete("/:id", deleteSource);

export default router;