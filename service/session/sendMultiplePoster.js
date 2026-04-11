import {
  client,
  waitForClientReady,
} from "../../config/whatsappClientConfig.js";
import pkg from "whatsapp-web.js";
import path from "path";
import { fileURLToPath } from "url";
import { markSessionCompleted } from "../../entities/sessionModels.js";

const { MessageMedia } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Sends session poster to multiple WhatsApp groups
 * @param {Object} session
 */
export default async function sendMultiplePosters(session) {
  try {
    console.log("📨 Sending posters for multiple sessions");
    await waitForClientReady();

    const chats = await client.getChats();

    const {
      id,
      title,
      description,
      date,
      time,
      gmeetLink,
      whatsappLink,
      selectedGroups,
      imageUrl,
    } = session;

    const groups = Array.isArray(selectedGroups)
      ? selectedGroups
      : JSON.parse(selectedGroups);

    // ✅ Safely filter valid group chats with required properties
    const validGroups = chats.filter(
      (chat) =>
        chat?.isGroup &&
        chat?.id &&
        chat?.id._serialized &&
        typeof chat.name === "string"
    );

    for (const groupName of groups) {
      try {
        const group = validGroups.find(
          (chat) => chat.name.toLowerCase() === groupName.toLowerCase()
        );

        if (!group) {
          console.warn(`⚠️ Group "${groupName}" not found or invalid`);
          continue;
        }

        const chatId = group.id._serialized;

        const caption = `💻 *${title}*
📝 ${description}

📅 *Date:* ${date}
⏰ *Time:* ${time || "TBA"}
📍 *Platform:* Google Meet

🔗 *Google Meet Link:* ${gmeetLink}
📲 *WhatsApp Group:* ${whatsappLink}`;

        const response = await fetch(imageUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mimeType = response.headers.get("content-type") || "image/jpeg";

        const media = new MessageMedia(mimeType, buffer.toString("base64"));

        await client.sendMessage(chatId, media, { caption });

        console.log(`✅ Poster sent to "${groupName}" for "${title}"`);
      } catch (err) {
        console.error(
          `❌ Error sending to group "${groupName}" for session "${title}":`,
          err.message
        );
        continue;
      }
    }

    await markSessionCompleted(id);
  } catch (err) {
    console.error("🚨 Fatal error in sendMultiplePosters:", err.message);
    throw new Error(err.message || "Failed to send session posters");
  }
}
