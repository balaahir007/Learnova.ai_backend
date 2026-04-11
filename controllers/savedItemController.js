import SavedItem from "../models/savedItemModel.js";
import Job from "../models/Jobs.js";
import Hackathon from "../models/Hackathon.js";

export const saveItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId, itemType } = req.body;

    if (!["job", "hackathon"].includes(itemType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item type",
      });
    }

    // Prevent duplicate save
    const existing = await SavedItem.findOne({
      where: { userId, itemId, itemType },
    });

    if (existing) {
      await SavedItem.destroy({
        where: { userId, itemId, itemType },
      });
       res.json({
        success: true,
      });
      return;
    }

    const saved = await SavedItem.create({ userId, itemId, itemType });

    res.json({
      success: true,
      message: "Saved successfully",
      data: saved,
    });
  } catch (error) {
    console.error("Save error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const removeSavedItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const deleted = await SavedItem.destroy({
      where: { id, userId },
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Saved item not found",
      });
    }

    res.json({
      success: true,
      message: "Removed successfully",
    });
  } catch (error) {
    console.error("Remove save error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getMySavedItems = async (req, res) => {
  try {
    const userId = req.user.id;

    const items = await SavedItem.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      include: [
        { model: Job, as: "jobDetails" },
        { model: Hackathon, as: "hackathonDetails" },
      ],
    });

    res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("Get saved items error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
