import mongoose from "mongoose";
const notebookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Notebook = mongoose.model("Notebook", notebookSchema);

export default Notebook;