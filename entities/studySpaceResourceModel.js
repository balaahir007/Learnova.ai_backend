import StudySpaceResource from "../models/studySpaceResource.js";
import StudySpace from "../models/studySpaceModel.js";
import { AppError } from "../utils/AppError.js";
import { Op } from "sequelize";

// Create a new resource
export const createResource = async (resourceData, userId) => {
  try {
    const resource = await StudySpaceResource.create({
      ...resourceData,
      uploadedBy: userId,
    });
    return resource;
  } catch (error) {
    throw new AppError({
      status: 500,
      errorCode: "RESOURCE_CREATION_FAILED",
      message: "Failed to create resource",
    });
  }
};

// Get all resources for a study space
export const getResourcesByStudySpace = async (studySpaceId, filters = {}) => {
  try {
    const whereClause = {
      studySpaceId,
      status: "active",
    };

    // Apply filters
    if (filters.resourceType) {
      whereClause.resourceType = filters.resourceType;
    }
    
    if (filters.tags && filters.tags.length > 0) {
      whereClause.tags = {
        [Op.overlap]: filters.tags
      };
    }

    if (filters.search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${filters.search}%` } },
        { description: { [Op.iLike]: `%${filters.search}%` } }
      ];
    }

    const resources = await StudySpaceResource.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: StudySpace,
          as: 'studySpace',
          attributes: ['name', 'id']
        }
      ]
    });

    return resources;
  } catch (error) {
    throw new AppError({
      status: 500,
      errorCode: "FETCH_RESOURCES_FAILED",
      message: "Failed to fetch resources",
    });
  }
};

// Get all resources (admin view)
export const getAllResources = async (filters = {}) => {
  try {
    const whereClause = {
      status: { [Op.ne]: "deleted" }
    };

    // Apply filters
    if (filters.studySpaceId) {
      whereClause.studySpaceId = filters.studySpaceId;
    }

    if (filters.resourceType) {
      whereClause.resourceType = filters.resourceType;
    }

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${filters.search}%` } },
        { description: { [Op.iLike]: `%${filters.search}%` } }
      ];
    }

    const resources = await StudySpaceResource.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: StudySpace,
          as: 'studySpace',
          attributes: ['name', 'id']
        }
      ]
    });

    return resources;
  } catch (error) {
    throw new AppError({
      status: 500,
      errorCode: "FETCH_ALL_RESOURCES_FAILED",
      message: "Failed to fetch all resources",
    });
  }
};

// Get a single resource by ID
export const getResourceById = async (resourceId) => {
  try {
    const resource = await StudySpaceResource.findOne({
      where: { 
        id: resourceId,
        status: { [Op.ne]: "deleted" }
      },
      include: [
        {
          model: StudySpace,
          as: 'studySpace',
          attributes: ['name', 'id']
        }
      ]
    });

    if (!resource) {
      throw new AppError({
        status: 404,
        errorCode: "RESOURCE_NOT_FOUND",
        message: "Resource not found",
      });
    }

    return resource;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError({
      status: 500,
      errorCode: "FETCH_RESOURCE_FAILED",
      message: "Failed to fetch resource",
    });
  }
};

// Update a resource
export const updateResource = async (resourceId, updateData, userId) => {
  try {
    const resource = await StudySpaceResource.findOne({
      where: { 
        id: resourceId,
        status: { [Op.ne]: "deleted" }
      }
    });

    if (!resource) {
      throw new AppError({
        status: 404,
        errorCode: "RESOURCE_NOT_FOUND",
        message: "Resource not found",
      });
    }

    // Check if user has permission to update (resource owner or admin)
    if (resource.uploadedBy !== userId) {
      // Additional admin check can be added here
      throw new AppError({
        status: 403,
        errorCode: "UNAUTHORIZED_UPDATE",
        message: "You don't have permission to update this resource",
      });
    }

    await resource.update(updateData);
    return resource;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError({
      status: 500,
      errorCode: "UPDATE_RESOURCE_FAILED",
      message: "Failed to update resource",
    });
  }
};

// Delete a resource (soft delete)
export const deleteResource = async (resourceId, userId) => {
  try {
    const resource = await StudySpaceResource.findOne({
      where: { 
        id: resourceId,
        status: { [Op.ne]: "deleted" }
      }
    });

    if (!resource) {
      throw new AppError({
        status: 404,
        errorCode: "RESOURCE_NOT_FOUND",
        message: "Resource not found",
      });
    }

    // Check if user has permission to delete (resource owner or admin)
    if (resource.uploadedBy !== userId) {
      // Additional admin check can be added here
      throw new AppError({
        status: 403,
        errorCode: "UNAUTHORIZED_DELETE",
        message: "You don't have permission to delete this resource",
      });
    }

    await resource.update({ status: "deleted" });
    return { message: "Resource deleted successfully" };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError({
      status: 500,
      errorCode: "DELETE_RESOURCE_FAILED",
      message: "Failed to delete resource",
    });
  }
};

// Archive/Unarchive a resource
export const toggleArchiveResource = async (resourceId, userId) => {
  try {
    const resource = await StudySpaceResource.findOne({
      where: { 
        id: resourceId,
        status: { [Op.ne]: "deleted" }
      }
    });

    if (!resource) {
      throw new AppError({
        status: 404,
        errorCode: "RESOURCE_NOT_FOUND",
        message: "Resource not found",
      });
    }

    const newStatus = resource.status === "active" ? "archived" : "active";
    await resource.update({ status: newStatus });
    
    return resource;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError({
      status: 500,
      errorCode: "TOGGLE_ARCHIVE_FAILED",
      message: "Failed to toggle archive status",
    });
  }
};

// Increment download count
export const incrementDownloadCount = async (resourceId) => {
  try {
    const resource = await StudySpaceResource.findByPk(resourceId);
    if (resource) {
      await resource.increment('downloadCount');
    }
    return resource;
  } catch (error) {
    // Don't throw error for download count increment failure
    console.error("Failed to increment download count:", error);
  }
};

// Get resource statistics
export const getResourceStats = async (studySpaceId = null) => {
  try {
    const whereClause = studySpaceId ? { studySpaceId } : {};
    
    const stats = await StudySpaceResource.findAll({
      where: whereClause,
      attributes: [
        'resourceType',
        [StudySpaceResource.sequelize.fn('COUNT', '*'), 'count']
      ],
      group: ['resourceType']
    });

    const totalResources = await StudySpaceResource.count({
      where: { ...whereClause, status: 'active' }
    });

    const archivedResources = await StudySpaceResource.count({
      where: { ...whereClause, status: 'archived' }
    });

    return {
      totalResources,
      archivedResources,
      byType: stats
    };
  } catch (error) {
    throw new AppError({
      status: 500,
      errorCode: "FETCH_STATS_FAILED",
      message: "Failed to fetch resource statistics",
    });
  }
};
