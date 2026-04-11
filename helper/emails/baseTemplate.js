const baseTemplate = (content) => `
  <div style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
    <div style="max-width:600px; margin:auto; background:white; border-radius:10px; padding:25px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">

      <!-- Header -->
      <div style="text-align:center; margin-bottom:20px;">
        <img   src="${
          process.env.COMPANY_LOGO || "https://morrowgen.com/logo.png"
        }" 
alt="MorrowGen Logo" style="width:140px;" />
        <h2 style="margin-top:10px; color:#222;">MorrowGen</h2>
      </div>

      <!-- Dynamic Content Here -->
      ${content}

      <!-- Footer -->
      <p style="font-size:13px; color:#999; text-align:center; margin-top:30px;">
        © ${new Date().getFullYear()} MorrowGen. All rights reserved.<br/>
        This is an automated email, please do not reply.
      </p>

    </div>
  </div>
`;

export default baseTemplate;
