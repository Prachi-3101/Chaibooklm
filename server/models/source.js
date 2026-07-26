import mongoose from "mongoose";

const sourceSchema = new mongoose.Schema(
  {
    notebookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notebook",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["pdf", "text", "website", "youtube", "vtt"],
      required: true,
    },

    status: {
      type: String,
      enum: ["uploading", "indexing", "ready", "failed"],
      default: "uploading",
    },

    originalUrl: String,

    filePath: String,

    chunkCount: {
      type: Number,
      default: 0,
    },

    error: String,
  },
  { timestamps: true }
);

const Source = mongoose.model("Source", sourceSchema);

export default Source;