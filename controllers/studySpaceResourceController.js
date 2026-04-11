import multer from "multer";
import path from "path";
import fs from "fs";
import isAdmin from "../helper/isAdmin.js";
import {
  createResource,
  getAllResources,
  getResourcesByStudySpace,
  getResourceById,
  updateResource,
  deleteResource,
  toggleArchiveResource,
  incrementDownloadCount,
  getResourceStats
} from "../entities/studySpaceResourceModel.js";
import { AppError } from "../utils/AppError.js";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'backend/uploads/resources';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow common file types
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/avi',
    'video/mov',
    'audio/mp3',
    'audio/wav',
    'audio/mpeg',
    'application/zip',
    'application/x-rar-compressed'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError({
      status: 400,
      errorCode: "INVALID_FILE_TYPE",
      message: "File type not allowed"
    }), false);
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: fileFilter
});

// Create a new resource
export const createResourceController = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const userIsAdmin = await isAdmin(userId);

    if (!userIsAdmin) {
      throw new AppError({
        status: 403,
        errorCode: "USER_IS_NOT_ADMIN",
        message: "User is not an admin",
      });
    }

    const { studySpaceId, title, description, resourceType, externalUrl, tags, isPublic } = req.body;
    
    if (!studySpaceId || !title || !resourceType) {
      throw new AppError({
        status: 400,
        errorCode: "MISSING_REQUIRED_FIELDS",
        message: "StudySpace ID, title, and resource type are required",
      });
    }

    const resourceData = {
      studySpaceId,
      title,
      description,
      resourceType,
      externalUrl,
      tags: tags ? JSON.parse(tags) : [],
      isPublic: isPublic !== undefined ? JSON.parse(isPublic) : true,
    };

    // Handle file upload
    if (req.file) {
      resourceData.fileUrl = req.file.path;
      resourceData.fileName = req.file.originalname;
      resourceData.fileSize = req.file.size;
      resourceData.mimeType = req.file.mimetype;
    }

    const newResource = await createResource(resourceData, userId);
    
    return res.status(201).json({
      success: true,
      data: newResource,
    });
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError({
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
            message: "An error occurred while creating the resource.",
          })
    );
  }
};

// Get all resources (admin view)
export const getAllResourcesController = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const userIsAdmin = await isAdmin(userId);

    if (!userIsAdmin) {
      throw new AppError({
        status: 403,
        errorCode: "USER_IS_NOT_ADMIN",
        message: "User is not an admin",
      });
    }

    const { studySpaceId, resourceType, status, search } = req.query;
    const filters = {
      studySpaceId,
      resourceType,
      status,
      search
    };

    const resources = await getAllResources(filters);
    
    return res.status(200).json({
      success: true,
      data: resources,
    });
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError({
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
            message: "An error occurred while fetching resources.",
          })
    );
  }
};

// Get resources by study space
export const getResourcesByStudySpaceController = async (req, res, next) => {
  try {
    const { studySpaceId } = req.params;
    const { resourceType, tags, search } = req.query;
    
    const filters = {
      resourceType,
      tags: tags ? tags.split(',') : [],
      search
    };

    const resources = await getResourcesByStudySpace(studySpaceId, filters);
    
    return res.status(200).json({
      success: true,
      data: resources,
    });
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError({
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
            message: "An error occurred while fetching study space resources.",
          })
    );
  }
};

// Get a single resource
export const getResourceController = async (req, res, next) => {
  try {
    const { resourceId } = req.params;
    const resource = await getResourceById(resourceId);
    
    return res.status(200).json({
      success: true,
      data: resource,
    });
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError({
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
            message: "An error occurred while fetching the resource.",
          })
    );
  }
};

// Update a resource
export const updateResourceController = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const userIsAdmin = await isAdmin(userId);

    if (!userIsAdmin) {
      throw new AppError({
        status: 403,
        errorCode: "USER_IS_NOT_ADMIN",
        message: "User is not an admin",
      });
    }

    const { resourceId } = req.params;
    const updateData = req.body;

    // Parse JSON fields if they exist
    if (updateData.tags) {
      updateData.tags = JSON.parse(updateData.tags);
    }
    if (updateData.isPublic !== undefined) {
      updateData.isPublic = JSON.parse(updateData.isPublic);
    }

    // Handle file upload for update
    if (req.file) {
      updateData.fileUrl = req.file.path;
      updateData.fileName = req.file.originalname;
      updateData.fileSize = req.file.size;
      updateData.mimeType = req.file.mimetype;
    }

    const updatedResource = await updateResource(resourceId, updateData, userId);
    
    return res.status(200).json({
      success: true,
      data: updatedResource,
    });
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError({
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
            message: "An error occurred while updating the resource.",
          })
    );
  }
};

// Delete a resource
export const deleteResourceController = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const userIsAdmin = await isAdmin(userId);

    if (!userIsAdmin) {
      throw new AppError({
        status: 403,
        errorCode: "USER_IS_NOT_ADMIN",
        message: "User is not an admin",
      });
    }

    const { resourceId } = req.params;
    const result = await deleteResource(resourceId, userId);
    
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError({
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
            message: "An error occurred while deleting the resource.",
          })
    );
  }
};

// Archive/Unarchive a resource
export const toggleArchiveResourceController = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const userIsAdmin = await isAdmin(userId);

    if (!userIsAdmin) {
      throw new AppError({
        status: 403,
        errorCode: "USER_IS_NOT_ADMIN",
        message: "User is not an admin",
      });
    }

    const { resourceId } = req.params;
    const resource = await toggleArchiveResource(resourceId, userId);
    
    return res.status(200).json({
      success: true,
      data: resource,
    });
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError({
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
            message: "An error occurred while toggling archive status.",
          })
    );
  }
};

// Download a resource
export const downloadResourceController = async (req, res, next) => {
  try {
    const { resourceId } = req.params;
    const resource = await getResourceById(resourceId);

    if (!resource.fileUrl) {
      throw new AppError({
        status: 400,
        errorCode: "NO_FILE_AVAILABLE",
        message: "No file available for download",
      });
    }

    // Increment download count
    await incrementDownloadCount(resourceId);

    // Send file
    const filePath = path.resolve(resource.fileUrl);
    
    if (!fs.existsSync(filePath)) {
      throw new AppError({
        status: 404,
        errorCode: "FILE_NOT_FOUND",
        message: "File not found on server",
      });
    }

    res.download(filePath, resource.fileName);
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError({
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
            message: "An error occurred while downloading the resource.",
          })
    );
  }
};

// Get resource statistics
export const getResourceStatsController = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const userIsAdmin = await isAdmin(userId);

    if (!userIsAdmin) {
      throw new AppError({
        status: 403,
        errorCode: "USER_IS_NOT_ADMIN",
        message: "User is not an admin",
      });
    }

    const { studySpaceId } = req.query;
    const stats = await getResourceStats(studySpaceId);
    
    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError({
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
            message: "An error occurred while fetching resource statistics.",
          })
    );
  }
};
