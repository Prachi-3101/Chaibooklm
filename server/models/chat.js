import mongoose from "mongoose";
const chatSchema = new mongoose.Schema(
  {
    notebookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notebook",
      required: true,
    },

    messages: [
      {
        role: String,
        content: String,

        citations: [
          {
            sourceId: String,
            chunk: String,
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export const Chat = mongoose.model("Chat", chatSchema);