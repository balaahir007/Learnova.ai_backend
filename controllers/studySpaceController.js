import isAdmin from "../helper/isAdmin.js";
import {
  approveJoinRequest,
  checkSpace,
  createStudySpace,
  exitStudySpace,
  fetchStudySpaceRequests,
  fetchTeacherSpaces,
  getAllPublicStudySpaces,
  getAllStudySpaces,
  getOneStudySpace,
  getStudySpaceAdmin,
  joinStudySpace,
} from "../entities/studySpaceModels.js";
import { AppError } from "../utils/AppError.js";
import checkFeatureLimit from "../utils/checkFeatureLimit.js";
import StudySpace from "../models/studySpaceModel.js";
import StudySpaceAdmin from "../models/studySpaceAdmins.js";
import User from "../models/userSchema.js";

export const createStudySpaceController = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    const newSpace = await createStudySpace(req.body, userId);
    return res.status(201).json({
      success: true,
      data: newSpace,
    });
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError({
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
            message: "An error occurred while creating the study space draft.",
          })
    );
  }
};

export const checkStudySpaceController = async (req, res, next) => {
  try {
    const spaceId = req.params.spaceId;
    const userId = req.user?.id;

    console.log("is Triggering",spaceId,"user Id : ",userId)
    if (!spaceId) {
      throw new AppError({
        status: 401,
        errorCode: "STUDY_SPACE_ID_IS_REQUIRED",
        message: "StudySpace is not logged in",
      });
    }
    if (!userId) {
      throw new AppError({
        status: 401,
        errorCode: "USER_ID_IS_REQUIRED",
        message: "User is not logged in",
      });
    }

    const studySpace = await checkSpace(spaceId, userId);
    console.log("studySpace", studySpace);

    return res.status(200).json({ success: true, data: studySpace });
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError({
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
            message: "An error occurred while checking the study space.",
          })
    );
  }
};
export const getInviteCodeController = async (req, res, next) => {
  try {
    const spaceId = req.params.spaceId;

    if (!spaceId) {
      throw new AppError({
        status: 401,
        errorCode: "STUDY_SPACE_ID_IS_REQUIRED",
        message: "StudySpace is not logged in",
      });
    }
   

    const studySpace = await StudySpace.findOne({where :{
      id : spaceId
    }})

    return res.status(200).json({ success: true, data: studySpace });
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError({
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
            message: "An error occurred while checking the study space.",
          })
    );
  }
};

export const joinStudySpaceController = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { inviteCode } = req.body;

    console.log("invite code : ",inviteCode,"user Id : ",userId)
    if (!inviteCode || !userId) {
      throw new AppError({
        status: 400,
        errorCode: "INVALID_REQUEST",
        message: "Invite code and user ID are required",
      });
    }

    const isJoined = await joinStudySpace(inviteCode, userId);

    console.log("isJoined",isJoined)
    if (isJoined) {
      return res.status(200).json({
        success: true,
      });
    }
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError({
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
            message: "An error occurred while joining the study space.",
          })
    );
  }
};

export const getOneStudySpaceController = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError({
        status: 401,
        errorCode: "USER_ID_IS_REQUIRED",
        message: "User is not logged in",
      });
    }

    const studySpace = await getOneStudySpace(userId);
    return res.status(200).json({ success: true, data: studySpace });
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError({
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
            message: "An error occurred while checking the study space.",
          })
    );
  }
};

export const getTeacherAllStudySpaces = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const allStudySpaces = await fetchTeacherSpaces(userId);
    console.log("strudy SPaces : ", allStudySpaces);
    return res.status(200).json({
      success: true,
      data: allStudySpaces,
    });
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError({
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
            message:
              error.message ||
              "An error occurred while getting all Teacher study spaces.",
          })
    );
  }
};

export const getAllStudySpaceMembers = async (req, res) => {
  try {
    const userId = req.user.id;
    // 1️⃣ Get study space
    const allStudySpaces = await StudySpaceAdmin.findAll({
      where: {
        adminId: userId,
      },
      include: [{ model: StudySpace, as: "studyspaces" }],
    });

    if (!allStudySpaces || allStudySpaces.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const studySpacesWithMembers = await Promise.all(
      allStudySpaces.map(async (item) => {
        const space = item.studyspaces;
        const memberIds = space.members || [];

        let members = [];
        if (memberIds.length > 0) {
          members = await User.findAll({
            where: { id: memberIds },
            attributes: ["id", "username", "email", "profilePicture", "role"],
          });
        }

        return {
          id: space.id,
          name: space.name,
          domain: space.domain,
          goal: space.goal,
          techSkills: space.techSkills,
          tags: space.tags,
          logo: space.logo,
          visibility: space.visibility,
          rules: space.rules,
          createdAt: space.createdAt,
          updatedAt: space.updatedAt,
          members,
        };
      })
    );

    // 3️⃣ Get users based on those IDs
    return res.status(200).json({
      success: true,
      data: studySpacesWithMembers,
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const getAllStudySpaceController = async (req, res, next) => {
  try {
    const allStudySpaces = await getAllStudySpaces();

    return res.status(200).json({
      success: true,
      data: allStudySpaces,
    });
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError({
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
            message: "An error occurred while getting all study spaces.",
          })
    );
  }
};
export const getAllPublicStudySpaceController = async (req, res, next) => {
  try {
    const allStudySpaces = await getAllPublicStudySpaces();

    return res.status(200).json({
      success: true,
      data: allStudySpaces,
    });
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError({
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
            message: "An error occurred while getting all study spaces.",
          })
    );
  }
};
export const fetchStudySpaceRequestsController = async (req, res, next) => {
  try {
    const { spaceId } = req.params;
    const requests = await fetchStudySpaceRequests(spaceId);
    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError({
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
            message:
              "An error occurred while fetching all study spaces Requests.",
          })
    );
  }
};

// this is pending as of now we ill talk about in the feature
// export const fetchMembersController = async (req, res, next) => {
//   try {
//     const { spaceId } = req.params;
//     const members = await fetchMembers(spaceId);
//     return res.status(200).json({
//       success: true,
//       data: requests,
//     });
//   } catch (error) {
//     return next(
//       error instanceof AppError
//         ? error
//         : new AppError({
//             status: 500,
//             errorCode: "INTERNAL_SERVER_ERROR",
//             message:
//               "An error occurred while fetching all study spaces Requests.",
//           })
//     );
//   }
// };
export const approveJoinRequestController = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;
    if (!userId) {
      throw new AppError({
        status: 401,
        errorCode: "USER_ID_IS_REQUIRED",
        message: "User is not logged in",
      });
    }
    const requests = await approveJoinRequest(requestId);
    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError({
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
            message:
              "An error occurred while fetching all study spaces Requests.",
          })
    );
  }
};
export const getStudySpacAdminController = async (req, res, next) => {
  try {
    const { spaceId } = req.params;
const userId = req?.user?.id
    const adminId = await getStudySpaceAdmin(spaceId,userId);
    return res.status(200).json({
      success: true,
      data: adminId,
    });
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError({
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
            message: "An error occurred while getStudySpacAdminController.",
          })
    );
  }
};
export const exitStudySpaceController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      throw new AppError({
        status: 401,
        errorCode: "USER_ID_IS_REQUIRED",
        message: "User is not logged in",
      });
    }
    const { spaceId } = req.params;
    const removedUser = await exitStudySpace(spaceId, userId);
    return res.status(200).json({
      success: true,
      data: removedUser,
    });
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError({
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
            message: "An error occurred while exitStudySpaceController.",
          })
    );
  }
};

export const canCreateFeature = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await checkFeatureLimit(userId, "groups:create", 1);

    if (!result.isAllowed) {
      return res.status(403).json({
        canCreate: false,
        error: result.error,
      });
    }

    return res.json({ canCreate: true });
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError({
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
            message: "Internal server error",
          })
    );
  }
};

// whiteboard controller
