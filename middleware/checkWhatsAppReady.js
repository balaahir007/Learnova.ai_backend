import { waitForClientReady } from "../config/whatsappClientConfig.js";

const checkWhatsAppReady = async (req, res, next) => {
  try {
    await waitForClientReady(); // Wait for client readiness
    next(); // Continue to your controller
  } catch (error) {
    return res.status(503).json({
      error: "WhatsApp client not ready. Please try again shortly.",
    });
  }
};

export default checkWhatsAppReady;
