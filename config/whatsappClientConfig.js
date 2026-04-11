import pkg from "whatsapp-web.js";
import fs from "fs";
import path from "path";

const { Client, LocalAuth } = pkg;

let client = null;
let clientReadyPromise = null;
let clientReadyResolve = null;
let clientReadyReject = null;

const sessionDir = path.resolve("./.wwebjs_auth");
const isFirstTime = !fs.existsSync(sessionDir);

function initializeClient() {
  if (client) return; // Prevent reinitialization

  client = new Client({
    authStrategy: new LocalAuth(), // Saves session locally in `.wwebjs_auth`
    puppeteer: {
      executablePath:
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      headless: !isFirstTime, // Show window only on first login
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage",
      ],
    },
  });

  clientReadyPromise = new Promise((resolve, reject) => {
    clientReadyResolve = resolve;
    clientReadyReject = reject;
  });

  client.on("qr", (qr) => {
    console.log("📱 QR Code received. Please scan:\n", qr);
  });

  client.on("authenticated", () => {
    console.log("🔐 Client authenticated successfully!");
  });

  client.on("ready", () => {
    console.log("✅ WhatsApp client is ready!");
    if (clientReadyResolve) clientReadyResolve();
  });

  client.on("auth_failure", (msg) => {
    console.error("❌ Authentication failure:", msg);
    if (clientReadyReject) clientReadyReject(new Error(`Auth failure: ${msg}`));
  });

  client.on("disconnected", (reason) => {
    console.warn("⚠️ Client disconnected:", reason);
    if (clientReadyReject)
      clientReadyReject(new Error(`Disconnected: ${reason}`));
    // Reset to allow re-initialization manually if needed
    client = null;
    clientReadyPromise = null;
    clientReadyResolve = null;
    clientReadyReject = null;
  });

  client.initialize().catch((err) => {
    console.error("🚨 Initialization error:", err.message);
    if (clientReadyReject)
      clientReadyReject(new Error(`Init failed: ${err.message}`));
  });
}

/**
 * Waits for the WhatsApp client to be ready.
 * Automatically initializes if not done yet.
 * @param {number} timeout - Timeout in ms (default: 2 minutes)
 */
function waitForClientReady(timeout = 120000) {
  if (!client) initializeClient();

  return Promise.race([
    clientReadyPromise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Client did not become ready in time")),
        timeout
      )
    ),
  ]);
}

export { client, waitForClientReady };
