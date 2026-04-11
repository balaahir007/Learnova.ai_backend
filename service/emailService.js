// services/emailService.js
import axios from "axios";

const brevoClient = axios.create({
  baseURL: "https://api.brevo.com/v3",
  headers: {
    accept: "application/json",
    "content-type": "application/json",
    "api-key": process.env.BREVO_API_KEY,
  },
});

export const sendEmail = async ({ toEmail, toName, subject, htmlContent }) => {
  try {
    if (!process.env.BREVO_API_KEY) {
      throw new Error("Brevo API key not found in environment variables");
    }

    const payload = {
      sender: {
        name: "MorrowGen",
        email: process.env.EMAIL,
      },
      to: [
        {
          email: toEmail,
          name: toName && toName.trim() !== "" ? toName : "User",
        },
      ],
      subject,
      htmlContent,
    };

    const response = await brevoClient.post("/smtp/email", payload);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
};
