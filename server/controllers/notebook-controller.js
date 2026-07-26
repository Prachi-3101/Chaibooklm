import Notebook from "../models/notebook.js";
import Source from "../models/source.js";

// Create Notebook
export const createNotebook = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const notebook = await Notebook.create({
      title,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Notebook created successfully",
      data: notebook,
    });
  } catch (error) {
    console.error("Create Notebook Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get All Notebooks
export const getNotebooks = async (req, res) => {
  try {
    const notebooks = await Notebook.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: notebooks.length,
      data: notebooks,
    });
  } catch (error) {
    console.error("Get Notebook Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get Single Notebook
export const getNotebookById = async (req, res) => {
  try {
    const notebook = await Notebook.findById(req.params.id);

    if (!notebook) {
      return res.status(404).json({
        success: false,
        message: "Notebook not found",
      });
    }

    res.status(200).json({
      success: true,
      data: notebook,
    });
  } catch (error) {
    console.error("Get Notebook Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Update Notebook
export const updateNotebook = async (req, res) => {
  try {
    const { title, description } = req.body;

    const notebook = await Notebook.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!notebook) {
      return res.status(404).json({
        success: false,
        message: "Notebook not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notebook updated successfully",
      data: notebook,
    });
  } catch (error) {
    console.error("Update Notebook Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Delete Notebook
export const deleteNotebook = async (req, res) => {
  try {
    const notebook = await Notebook.findByIdAndDelete(req.params.id);

    if (!notebook) {
      return res.status(404).json({
        success: false,
        message: "Notebook not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notebook deleted successfully",
    });
  } catch (error) {
    console.error("Delete Notebook Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get Sources for a Notebook
export const getNotebookSources = async (req, res) => {
  try {
    const sources = await Source.find({ notebookId: req.params.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sources.length,
      data: sources,
    });
  } catch (error) {
    console.error("Get Notebook Sources Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};