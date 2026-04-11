import baseTemplate from "./baseTemplate.js";

const passwordResetTemplate = (resetLink) => {
  const content = `
    <h2 style="color:#333;">Reset Your Password</h2>

    <p style="font-size:16px; color:#444;">
      We received a request to reset your password. Click the button below:
    </p>

    <p style="text-align:center; margin:25px 0;">
      <a href="${resetLink}"
         style="background:#ff3b3b; padding:14px 24px; color:white; text-decoration:none; border-radius:6px;">
         Reset Password
      </a>
    </p>

    <p style="font-size:14px; color:#777;">
      If you didn’t request this, you can safely ignore this email.
    </p>
  `;

  return baseTemplate(content);
};

export default passwordResetTemplate;
