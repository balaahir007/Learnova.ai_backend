import { Op } from "sequelize";
import { sequelize } from "../config/connectDB.js";
import Session from "../models/sessionModel.js";
import Participant from "../models/participantModel.js";
import Group from "../models/groupModel.js";
import { QueryTypes } from "sequelize";

export const createNewSession = async (sessionData, createdByUserId) => {
  try {
    const {
      title,
      description,
      date,
      time,
      gmeetLink,
      whatsappLink,
      selectedGroups,
      imageUrl,
    } = sessionData;

    if (
      !title?.trim() ||
      !description?.trim() ||
      !date ||
      !time ||
      !whatsappLink?.trim() ||
      !Array.isArray(selectedGroups) ||
      selectedGroups.length === 0
    ) {
      throw new Error(
        "All fields are required. Please provide complete session data."
      );
    }

    const newSession = await Session.create({
      title,
      description,
      date,
      time,
      gmeetLink: gmeetLink || null,
      whatsappLink,
      selectedGroups,
      imageUrl: imageUrl || null,
      createdBy: createdByUserId,
    });

    if (!newSession) {
      throw new Error("Error creating a session");
    }
    return newSession;
  } catch (error) {
    throw error;
  }
};

export const fetchPendingSessions = async () => {
  const now = new Date().toISOString(); // current UTC timestamp
  try {
    const allPending = await Session.findAll({
      where: {
        status: "pending",
      },
      raw: true,
    });
    return allPending;
  } catch (error) {
    console.error("Error fetching pending schedules:", error);
    throw new Error("Failed to fetch pending schedules");
  }
};

export const markSessionCompleted = async (sessionId) => {
  try {
    const [updatedCount, updatedRows] = await Session.update(
      { status: "completed" },
      {
        where: { id: sessionId },
        returning: true,
      }
    );

    if (updatedCount === 0) {
      return null; // no session found with given id
    }

    return updatedRows[0]; // return updated session
  } catch (error) {
    console.error("Error updating session status:", error);
    throw error;
  }
};

export const updateSessionFromDB = async (sessionId, data) => {
  try {
    console.log("🛠 ID to update:", sessionId);
    console.log("📦 Data to update:", data);

    const session = await Session.findByPk(sessionId);

    if (!session) {
      throw new Error("Session not found");
    }

    const { dataObj } = data;

    // Set all data from dataObj
    session.set(dataObj);

    // Force selectedGroups as changed
    if (Array.isArray(dataObj.selectedGroups)) {
      session.set("selectedGroups", dataObj.selectedGroups);
      session.changed("selectedGroups", true);
    }

    await session.save();
    return session;
  } catch (error) {
    throw new Error("Failed to update session: " + error.message);
  }
};





export const removeSessionFromDB = async (sessionId) => {
  try {
    const deletedCount = await Session.destroy({
      where: { id: sessionId },
    });

    // You might want to remove this throw here if your controller handles 0 deletedCount
    // based on the new logic above, but it's not strictly incorrect to have it.
    if (deletedCount === 0) {
      throw new Error(`No session found with ID ${sessionId}`);
    }

    return deletedCount;
  } catch (error) {
    // Re-throwing the error to be caught by the controller's try-catch
    throw new Error("Failed to delete session: " + error.message);
  }
};

export const getAllSessionsFromDB = async () => {
  try {
    const allSessions = await Session.findAll({ raw: true });
    return allSessions;
  } catch (error) {
    throw new Error("Failed to fetch all sessions");
  }
};
export const createNewParticipant = async (participantData, createdBy) => {
  try {
    const { participantName, participantNumber } = participantData;

    // Validate inputs
    if (!participantName?.trim() || !participantNumber?.trim()) {
      throw new Error("All fields are required");
    }

    // Create participant
    const newParticipant = await Participant.create({
      participantName: participantName.trim(),
      participantNumber: participantNumber.trim(),
      createdBy,
    });

    return newParticipant;
  } catch (error) {
    throw new Error("Failed to create participant: " + error.message);
  }
};
export const getAllParticipantsFromDB = async () => {
  try {
    const allParticipants = await Participant.findAll();
    return allParticipants;
  } catch (error) {
    throw new Error("Failed to getAll participants: " + error.message);
  }
};
export const getAllGroupsFromDB = async () => {
  try {
    const groups = await Group.findAll();
    return groups;
  } catch (error) {
    throw new Error("Failed to getAll participants: " + error.message);
  }
};
export const createGroupFromDB = async (data) => {
  try {
    const { groupName, selectedParticipants } = data;
    const group = await Group.create({ groupName });
    const participants = await Participant.findAll({
      where: { participantNumber: selectedParticipants },
    });

    // 3. Associate participants with the group
    await group.addParticipants(participants);
    return group;
  } catch (error) {
    throw new Error("Failed to getAll participants: " + error.message);
  }
};
