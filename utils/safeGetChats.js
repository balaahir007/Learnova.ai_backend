export default  async function safeGetChats(client, retries = 3, delayMs = 1500) {
  for (let i = 0; i < retries; i++) {
    try {
      const chats = await client.getChats();

      // Basic validation - if any chat is undefined, retry
      if (chats.some(chat => !chat || !chat.id)) {
        throw new Error("Malformed chats detected");
      }

      return chats;
    } catch (err) {
      console.warn(`getChats attempt ${i + 1} failed: ${err.message}`);
      if (i < retries - 1) {
        await new Promise((r) => setTimeout(r, delayMs));
      } else {
        throw err;
      }
    }
  }
}
