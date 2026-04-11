import { Op } from "sequelize";
import StudySpace from "../models/studySpaceModel.js";
import { generateInviteCode } from "../utils/studySpaceLinks.js";
import { AppError } from "../utils/AppError.js";
import { v4 as uuidv4 } from "uuid";
import StudySpaceAdmin from "../models/studySpaceAdmins.js";
import JoinRequest from "../models/studySpacejoinRequest.js";
import User from "../models/userSchema.js";

export const createStudySpace = async (studySpaceData, adminId) => {
  const myUUID = uuidv4();
  try {
    const inviteCode = generateInviteCode(30);

    if (
      !studySpaceData.name ||
      !studySpaceData.domain ||
      !studySpaceData.goal ||
      !studySpaceData.techSkills
    ) {
      throw new AppError({
        status: 400,
        errorCode: "MISSING_REQUIRED_FIELDS",
        message:
          "Please provide all required fields: name, domain, goal, and techSkills.",
      });
    }

    const existingSpace = await StudySpace.findOne({
      where: { name: studySpaceData.name },
    });

    if (existingSpace) {
      throw new AppError({
        status: 400,
        errorCode: "STUDY_SPACE_ALREADY_EXISTS",
        message: "Study space with this name already exists.",
      });
    }

    const newStudySpace = await StudySpace.create({
      ...studySpaceData,
      id: myUUID,
      logo: studySpaceData.logo || null,
      inviteCode,
      members: [adminId],
    });

    if (newStudySpace) {
      await StudySpaceAdmin.create({
        spaceId: newStudySpace.id,
        adminId,
      });
    }

    return newStudySpace;
  } catch (error) {
    throw error instanceof AppError
      ? error
      : new AppError({
          status: 500,
          errorCode: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong while creating the study space.",
        });
  }
};

export const getAllStudySpaces = async () => {
  return await StudySpace.findAll();
};
export const getAllPublicStudySpaces = async () => {
  return await StudySpace.findAll({
    where: {
      visibility: "public",
    },
  });
};

export const checkSpace = async (spaceId, userId) => {
  const studySpace = await StudySpace.findOne({
    where: { id: spaceId },
  });

  console.log("study space data  : ", studySpace);

  if (!studySpace) {
    throw new AppError({
      status: 404,
      errorCode: "STUDY_SPACE_NOT_FOUND",
      message: "Study space not found",
    });
  }

  if (!Array.isArray(studySpace.members)) {
    throw new AppError({
      status: 500,
      errorCode: "INVALID_MEMBERS_ARRAY",
      message: "Study space members data is invalid",
    });
  }

  if (!studySpace.members.includes(userId)) {
    console.log("error getting ");
    throw new AppError({
      status: 403,
      errorCode: "USER_NOT_IN_STUDY_SPACE",
      message: "User is not a member of this study space",
    });
  }

  return studySpace;
};

export const getOneStudySpace = async (userId) => {
  const studySpace = await StudySpace.findAll({
    where: {
      members: {
        [Op.contains]: [userId],
      },
    },
  });

  console.log("Study Space : ",studySpace)

  if (!studySpace) {
    throw new AppError({
      status: 404,
      errorCode: "STUDY_SPACE_NOT_FOUND",
      message: "Study space not found",
    });
  }

  return studySpace;
};
export const fetchTeacherSpaces = async (userId) => {
  const studySpaces = await StudySpaceAdmin.findAll({
    where: {
      adminId: userId,
    },
    include: [{ model: StudySpace, as: "studyspaces" }],
  });

  if (!studySpaces) {
    throw new AppError({
      status: 404,
      errorCode: "STUDY_SPACES_EMPTY",
      message: "Study space is empty",
    });
  }

  return studySpaces;
};
export const fetchStudySpaceRequests = async (spaceId) => {
  const requests = await JoinRequest.findAll({
    where: {
      status: "pending",
      spaceId: spaceId,
    },
    include: [
      {
        model: StudySpace,
        as: "studySpace",
        attributes: ["id", "name", "domain", "goal", "techSkills"],
      },
      {
        model: User,
        as: "user",
        attributes: ["id", "username", "email"],
      },
    ],
  });
  return requests;
};

export const joinStudySpace = async (inviteCode, userId) => {
  const studySpace = await StudySpace.findOne({
    where: { inviteCode },
  });

  if (!studySpace) {
    throw new AppError({
      status: 404,
      errorCode: "STUDY_SPACE_NOT_FOUND",
      message: "Study space not found",
    });
  }

  console.log("members : ", studySpace.members);
  let members = Array.isArray(studySpace.members)
    ? studySpace.members
    : Object.values(studySpace.members) || [];
  if (!Array.isArray(members)) {
    throw new AppError({
      status: 500,
      errorCode: "INVALID_MEMBERS_LIST",
      message: "Invalid members list",
    });
  }
  console.log(userId);

  if (members.includes(userId)) {
    throw new AppError({
      status: 400,
      errorCode: "USER_ALREADY_MEMBER",
      message: "User is already a member of this study space",
    });
  }
  if (studySpace.visibility === "public") {
    members.push(userId);
    await studySpace.update({ members });

    // 🟢 IMPORTANT FIX
    await studySpace.reload();
    console.log(studySpace);
    return true;
  }
  const existingRequest = await JoinRequest.findOne({
    where: {
      spaceId: studySpace.id,
      userId,
    },
  });
  if (existingRequest) {
    throw new AppError({
      status: 400,
      errorCode: "JOIN_REQUEST_ALREADY_EXISTS",
      message:
        "Join request already exists for this user in this study space, Please wait for approval.",
    });
  }

  const joinRequest = await JoinRequest.create({
    spaceId: studySpace.id,
    userId,
    status: "pending",
  });

  return joinRequest;
};
export const approveJoinRequest = async (requestId) => {
  const request = await JoinRequest.findOne({
    where: { id: requestId },
  });
  console.log(request);

  if (!request) {
    throw new AppError({
      status: 404,
      errorCode: "JOIN_REQUEST_NOT_FOUND",
      message: "Join request not found",
    });
  }

  const studySpace = await StudySpace.findOne({
    where: { id: request.spaceId },
  });

  if (!studySpace) {
    throw new AppError({
      status: 404,
      errorCode: "STUDY_SPACE_NOT_FOUND",
      message: "Study space not found",
    });
  }

  let members = Array.isArray(studySpace.members)
    ? [...studySpace.members]
    : [];

  if (!Array.isArray(members)) {
    throw new AppError({
      status: 500,
      errorCode: "INVALID_MEMBERS_LIST",
      message: "Invalid members list",
    });
  }

  const userId = Number(request.userId); // make sure it's an integer

  if (members.includes(userId)) {
    throw new AppError({
      status: 400,
      errorCode: "USER_ALREADY_MEMBER",
      message: "User is already a member of this study space",
    });
  }

  members.push(userId);

  // Force update members field
  studySpace.setDataValue("members", members);
  studySpace.changed("members", true);
  await studySpace.save();

  request.status = "approved";
  await request.save();

  return request;
};
export const getStudySpaceAdmin = async (spaceId, userId) => {
  const space = await StudySpaceAdmin.findOne({
    where: { spaceId, adminId: userId },
  });

  console.log("space in ", space);
  if (!space) {
    throw new AppError({
      status: 404,
      errorCode: "JOIN_REQUEST_NOT_FOUND",
      message: "Join request not found",
    });
  }

  return space.adminId;
};
export const exitStudySpace = async (spaceId, userId) => {
  const studySpace = await StudySpace.findOne({
    where: { id: spaceId },
  });
  console.log(studySpace);

  console.log("spaceId", spaceId);
  let members = Array.isArray(studySpace.members)
    ? [...studySpace.members]
    : [];
  const isUserExits = members.includes(userId);
  if (!isUserExits) {
    throw new AppError({
      status: 404,
      errorCode: "USER_NOT_EXITS",
      message: "User not exits in the study space",
    });
  }

  if (members.length == 0) {
    throw new AppError({
      status: 404,
      errorCode: "STUDY_SPACE_MEMBERS_EMPTY",
      message: "study space memmber's list empty",
    });
  }

  const newMembersList =
    members && members.length > 0
      ? members.filter((memberId) => memberId !== userId)
      : [];

  studySpace.setDataValue("members", newMembersList);
  studySpace.changed("members", true);
  await studySpace.save();

  return userId;
};
