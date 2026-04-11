import StudySpaceChat from "../models/studySpaceChat.js";
import User from "../models/userSchema.js";

export const saveMessage = async (data, userId) => {
  try {
    const { message, spaceId } = data;
        if (!message || !spaceId || !userId) {
      throw new Error("Missing required fields: message, spaceId, or userId");
    }
    
    const chat = await StudySpaceChat.create({ 
      message: message.trim(), 
      spaceId, 
      userId 
    });
    
    const currentChat = await StudySpaceChat.findOne({
      where: { id: chat.id },
      include: {
        model: User,
        as: 'author',
        attributes: ['username', 'id', 'email','profilePicture']
      }
    });
    
    if (!currentChat) {
      throw new Error("Failed to retrieve saved message");
    }
    
    const plainChat = currentChat.get({ plain: true });
    console.log("currentChat", plainChat);
    
    return plainChat;
    
  } catch (error) {
    console.error("Error saving message:", error);
    throw error;
  }
};

export const fetchAllMessages = async (spaceId) => {
  try {
    if (!spaceId) {
      throw new Error("spaceId is required");
    }
    
    const allChats = await StudySpaceChat.findAll({
      where: { spaceId },
      include: {
        model: User,
        as: "author",
        attributes: ["username", "id", "email",'profilePicture']
      },
      order: [['createdAt', 'ASC']] 
    });
    
    return allChats.map(chat => chat.get({ plain: true }));
    
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};