export default async function getGroupIdFromInviteLink(client, whatsappLink, groupName) {
  try {
    const chats = await client.getChats();

    if (!Array.isArray(chats)) {
      console.warn("Chats is not an array");
      return null;
    }

    const group = chats.find(
      (chat) =>
        chat && chat.isGroup && chat.name && chat.name.toLowerCase() === groupName.toLowerCase()
    );

    if (!group) {
      console.warn(`⚠️ Group with name "${groupName}" not found`);
      return null;
    }

    if (!group.id || !group.id._serialized) {
      console.warn(`⚠️ Group ID or _serialized missing for group "${groupName}"`);
      return null;
    }

    return group.id._serialized;
  } catch (error) {
    console.error("❌ Error in getGroupIdFromInviteLink:", error);
    return null;
  }
}
