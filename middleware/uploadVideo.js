import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import { v4 as uuidv4 } from "uuid";

const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: "videos",
    resource_type: "video",
    allowed_formats: ["mp4", "mov", "avi", "mkv"],
    public_id: (req, file) => {
      const baseName = file.originalname
        .split(".")[0]
        .trim()
        .replace(/\s+/g, "_");
      return `${baseName}_${uuidv4()}`;
    },
  },
});

const uploadVideo = multer({ storage: videoStorage });

export default uploadVideo;
