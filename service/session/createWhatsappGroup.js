import {
  client,
  waitForClientReady,
} from "../../config/whatsappClientConfig.js";

export const createWhatsappGroup = async ({
  groupName,
  selectedParticipants,
}) => {
  try {
    await waitForClientReady();

    const participants = [];
    for (let num of selectedParticipants) {
      let cleanNum = num.replace(/\D/g, "");
      if (cleanNum.length === 10) {
        cleanNum = "91" + cleanNum;
      }
      const waId = cleanNum + "@c.us";
      const isRegistered = await client.isRegisteredUser(waId);
      if (isRegistered) {
        participants.push(waId);
      } else {
        console.warn(
          `⚠️ Number ${waId} is not a registered WhatsApp user and will be skipped.`
        );
      }
    }

    if (participants.length === 0) {
      throw new Error(
        "❌ No valid WhatsApp users found in selected participants."
      );
    }

    let chats;
    try {
      chats = await client.getChats();
    } catch (e) {
      console.error("❌ Error fetching chats:", e);
      throw e;
    }

    const validChats = chats.filter(
      (chat) => chat && chat.id && chat.id._serialized && chat.isGroup && chat.name
    );

    const groupExists = validChats.find((chat) => chat.name === groupName);
    if (groupExists) {
      throw new Error("⚠️ A group with this name already exists in WhatsApp.");
    }

    const group = await client.createGroup(groupName, participants);
    console.log("Created group object:", group);

    const chatId =
      group.gid?._serialized || group.id?._serialized || group.groupMetadata?.id?._serialized;

    if (!chatId) {
      throw new Error("❌ Could not find group ID after creation");
    }

    const chat = await client.getChatById(chatId);
    await chat.promoteParticipants(participants);

    console.log("✅ Group created successfully:", group);
    return group;
  } catch (error) {
    console.error("❌ Failed to create group:", error.message || error);
    throw error;
  }
};
