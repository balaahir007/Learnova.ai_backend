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

export default async function handleSendSinglePoster(sessionData) {
    try {
        console.log(`📨 Sending poster for session: ${sessionData.title}`);

        ;
        console.log("Client reported ready.");

        // --- NEW ADDITION HERE ---
        // Give WhatsApp Web a moment to fully stabilize after 'ready' event
        // Sometimes, the 'ready' event fires before all internal data structures are fully populated.
        console.log("Waiting for a brief moment to ensure WhatsApp Web is fully hydrated...");
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for 3 seconds
        console.log("Proceeding to fetch chats after brief delay.");
        // --- END NEW ADDITION ---

        // Attempt to retrieve chats with a retry mechanism if needed, though the core issue is likely client readiness.
        let chats;
        try {
            chats = await client.getChats();
            console.log(`Successfully fetched ${chats.length} chats.`);
        } catch (chatFetchError) {
            console.error("❌ Error fetching chats:", chatFetchError.message);
            // Re-throw or handle as a critical error if chats cannot be fetched
            throw new Error(`Failed to retrieve chats: ${chatFetchError.message}`);
        }


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

        // Ensure selectedGroups is always an array
        let groups;
        if (typeof selectedGroups === 'string') {
            try {
                groups = JSON.parse(selectedGroups);
                if (!Array.isArray(groups)) {
                    throw new Error('Parsed selectedGroups is not an array.');
                }
            } catch (parseError) {
                console.error(`❌ Error parsing selectedGroups: ${selectedGroups}. Falling back to empty array.`, parseError);
                groups = []; // Fallback to an empty array if parsing fails
            }
        } else if (Array.isArray(selectedGroups)) {
            groups = selectedGroups;
        } else {
            console.warn("⚠️ selectedGroups is neither a string nor an array. Defaulting to empty array.");
            groups = [];
        }

        if (groups.length === 0) {
            console.warn("No groups selected for sending poster. Skipping.");
            return; // Exit if no groups are selected
        }

        // Validate image URL before proceeding
        if (!imageUrl) {
            throw new Error("Image URL is missing in session data.");
        }

        let media;
        try {
            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.statusText}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const mimeType = response.headers.get("content-type") || "image/jpeg"; // Default to jpeg if type is not found
            media = new MessageMedia(mimeType, buffer.toString("base64"));
            console.log("Image fetched and converted to MessageMedia.");
        } catch (imageError) {
            console.error("❌ Error processing image for poster:", imageError.message);
            // If image fails, decide whether to send text only or fail the whole operation
            throw new Error(`Failed to process image: ${imageError.message}`);
        }

        const caption = `💻 *${title}*
📝 ${description}

📅 *Date:* ${date}
⏰ *Time:* ${time || "TBA"}
📍 *Platform:* Google Meet

🔗 *Google Meet Link:* ${gmeetLink}
📲 *WhatsApp Group:* ${whatsappLink}`;

        for (const groupName of groups) {
            try {
                // Ensure groupName is a string before calling toLowerCase
                if (typeof groupName !== 'string') {
                    console.warn(`⚠️ Invalid group name type encountered: ${groupName}. Skipping.`);
                    continue;
                }

                const group = chats.find(
                    (chat) =>
                        chat && // Ensure chat object itself is not null/undefined
                        chat.isGroup && // Ensure it's a group chat
                        chat.name && // Ensure chat.name exists
                        typeof chat.name === "string" && // Ensure chat.name is a string
                        chat.name.toLowerCase() === groupName.toLowerCase() &&
                        chat.id && // Ensure chat.id exists
                        chat.id?._serialized
                );

                if (!group) {
                    console.warn(`⚠️ Group "${groupName}" not found in fetched chats.`);
                    continue;
                }

                // Double check these properties here, although the find predicate tries to catch them
                if (!group.id || !group.id?._serialized) {
                    console.warn(`⚠️ Group "${groupName}" found but its ID is invalid or missing _serialized property.`);
                    continue; // Skip this group if its ID is malformed
                }

                const chatId = group.id?._serialized;

                console.log(`Attempting to send poster to group: "${groupName}" (Chat ID: ${chatId})`);
                await client.sendMessage(chatId, media, { caption });
                if(sessionData?.id){
                  await markSessionCompleted(sessionData?.id)
                }
                console.log(`✅ Poster sent to "${groupName}"`);

            } catch (err) {
                console.error(
                    `❌ Error sending to group "${groupName}":`,
                    err.message || err // Log the full error if it's not just a message
                );
                // Continue to the next group even if one fails
                continue;
            }
        }
    } catch (err) {
        console.error("🚨 Critical Error in handleSendSinglePoster:", err.message || err);
        // Re-throw to be caught by the sendSession controller
        throw new Error(err.message || "Failed to send single session poster due to an unhandled error.");
    }
}