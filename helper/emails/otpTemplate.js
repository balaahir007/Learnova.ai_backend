import baseTemplate from "./baseTemplate.js";

const otpTemplate = (otp) => {
  const content = `
    <p style="font-size:16px; color:#444;">Hello,</p>

    <p style="font-size:16px; color:#444;">
      Use the OTP below to verify your account with <b>MorrowGen</b>.
    </p>

    <div style="
      text-align:center;
      padding:15px; 
      margin:25px 0; 
      background:#eef7ff; 
      border-radius:8px;
      font-size:28px; 
      letter-spacing:5px; 
      font-weight:bold;
    ">
      ${otp}
    </div>

    <p style="font-size:15px; color:#666;">
      This OTP expires in <b>5 minutes</b>.
    </p>
  `;

  return baseTemplate(content);
};

export default otpTemplate;
