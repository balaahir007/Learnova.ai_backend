import { v4 as uuidv4 } from "uuid";
import StudySpaceMeet from "../../models/StudySpaceMeet.js";
import MeetParticipant from "../../models/MeetParticipant.js";
import StudySpace from "../../models/studySpaceModel.js";
import User from "../../models/userSchema.js";

class MeetServices {
  async createMeet({ spaceId, userId, name }) {
    // 1️⃣ Check if study space exists
    const space = await StudySpace.findByPk(spaceId);
    if (!space) throw new Error("Study space not found");

    // 2️⃣ Check existing meets count
    const meetCount = await StudySpaceMeet.count({ where: { spaceId } });
    if (meetCount >= space.maxMeet) {
      throw new Error(`You can only create up to ${space.maxMeet} meets in this StudySpace`);
    }

    // 3️⃣ Create the meet
    const newMeet = await StudySpaceMeet.create({
      id: uuidv4(),
      spaceId,
      name,
      creatorId: userId,
      startTime: new Date(),
    });

    // 4️⃣ Add host as participant
    await MeetParticipant.create({ meetId: newMeet.id, userId });

    // 5️⃣ Fetch meet with participants + user details
    const meetWithParticipants = await StudySpaceMeet.findByPk(newMeet.id, {
      include: [{
        model: MeetParticipant,
        as: "participants",
        include: [{ model: User, as: "user", attributes: ["id", "username", "email", "profilePicture"] }]
      }],
    });

    return meetWithParticipants;
  }

  async meetJoined({ meetId, userId }) {
    console.log(meetId,userId)
    const meet = await StudySpaceMeet.findByPk(meetId);
    if (!meet) throw new Error("Meet not found");

    const existingParticipant = await MeetParticipant.findOne({ where: { meetId, userId } });
    if (existingParticipant) throw new Error("User is already in the meet");

    // Add participant
    const newParticipant = await MeetParticipant.create({ meetId, userId });

    // Fetch participant with user info
    return await MeetParticipant.findByPk(newParticipant.id, {
      include: [{ model: User, as: "user", attributes: ["id", "username", "email", "profilePicture"] }],
    });
  }

  async meetLeft({ meetId, userId }) {
    const participant = await MeetParticipant.findOne({
      where: { meetId, userId },
      include: [{ model: User, as: "user", attributes: ["id", "username", "email", "profilePicture"] }]
    });

    if (!participant) throw new Error("User not found in the meet");

    await participant.destroy();

    const remaining = await MeetParticipant.count({ where: { meetId } });
    if (remaining === 0) await this.endMeet(meetId);

    return { userId, meetId };
  }

  async endMeet(meetId) {
    const meet = await StudySpaceMeet.findByPk(meetId, {
      include: [{ model: MeetParticipant, as: "participants", include: [{ model: User, as: "user" }] }],
    });

    if (!meet) throw new Error("Meet not found");

    await MeetParticipant.destroy({ where: { meetId } });
    await meet.destroy();

    return { success: true, message: "Meet and participants deleted" };
  }
}

export default new MeetServices();
