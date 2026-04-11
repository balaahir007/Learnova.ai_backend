import { fetchAllMessages, saveMessage } from "../entities/studySpaceChat.js";

const handleMessage = async (data, socket) => {
  try {
    const userId = socket.userId;
    console.log("Handling message from userId:", userId, "Data:", data);
    if (!data.message || !data.spaceId || !userId) {
      socket.emit("error", { message: "Missing required data" });
      return;
    }

    const savedChat = await saveMessage(data, userId);
    socket.to(`space-${data.spaceId}`).emit("receive-chat-msg", savedChat);
  } catch (error) {
    console.error("Error handling message:", error);
    socket.emit("error", { message: "Failed to save message" });
  }
};
const fetchAllMsg = async (data, socket) => {
  try {
    const spaceId = data;

    if (!spaceId) {
      socket.emit("error", { message: "spaceId is required" });
      return;
    }

    const allMessages = await fetchAllMessages(spaceId);
    console.log("all messages count:", allMessages.length);

    socket.emit("receive-fetchall-chat-msg", allMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    socket.emit("error", { message: "Failed to fetch messages" });
  }
};

export default { handleMessage, fetchAllMsg };
