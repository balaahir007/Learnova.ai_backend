// utils/qrCodeGenerator.js
import QRCode from "qrcode";

export const generateQRCode = async (text) => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(text, {
      width: 200,
      margin: 2,
      color: {
        dark: "#0097B2",
        light: "#FFFFFF",
      },
    });
    return qrCodeDataUrl;
  } catch (err) {
    console.error("QR Code generation failed:", err);
    return null;
  }
};