import MeetParticipant from "../models/MeetParticipant.js";
import StudySpaceMeet from "../models/StudySpaceMeet.js";
import User from "../models/userSchema.js";

// Get a single meet with participants
export const getMeet = async (meetId) => {
  return await StudySpaceMeet.findOne({
    where: { id: meetId },
    include: [
      {
        model: MeetParticipant,
        as: "participants",
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "username", "email",'profilePicture'], // choose fields you need
          },
        ],
      },
    ],
  });
};

export const getAllMeets = async (spaceId) => {
  return await StudySpaceMeet.findAll({
    where: { spaceId },
    include: [{ model: MeetParticipant, as: "participants" }],
  });
};
