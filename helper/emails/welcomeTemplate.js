import baseTemplate from "./baseTemplate.js";

const welcomeTemplate = (username) => {
  const content = `
    <h2 style="color:#222; font-size:22px;">Welcome to MorrowGen, ${username}! 🎉</h2>

    <p style="font-size:16px; color:#555; line-height:1.6;">
      You’re now part of a learning community built to advance your skills, boost your confidence, 
      and accelerate your journey toward your dream career.
    </p>

    <div style="
      background:#f7fbff;
      padding:20px;
      border-radius:10px;
      margin:25px 0;
      border-left:4px solid #4b8bff;
    ">
      <h3 style="margin:0; color:#1b4dcc;">🚀 What You Can Do Inside MorrowGen</h3>
      <ul style="margin-top:10px; padding-left:20px; color:#444; font-size:15px; line-height:1.6;">
        <li>Personalized learning roadmaps for faster growth</li>
        <li>Career planning tools to help you land top roles</li>
        <li><b>Study-Space:</b> Join friends, study together, and collaborate in real time</li>
        <li>Track your progress and stay consistent</li>
      </ul>
    </div>

    <p style="text-align:center; margin-top:30px;">
      <a href="https://morrowgen.com/dashboard"
        style="
          background:#1b4dcc;
          padding:14px 24px;
          color:white;
          text-decoration:none;
          border-radius:8px;
          font-size:16px;
        ">
        Go to Dashboard
      </a>
    </p>
  `;

  return baseTemplate(content);
};

export default welcomeTemplate;
