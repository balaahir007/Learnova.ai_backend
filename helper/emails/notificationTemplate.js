import baseTemplate from "./baseTemplate.js";

const notificationTemplate = (title, message) => {
  const content = `
    <h2 style="color:#333;">${title}</h2>

    <p style="font-size:16px; color:#444;">
      ${message}
    </p>
  `;

  return baseTemplate(content);
};

export default notificationTemplate;
