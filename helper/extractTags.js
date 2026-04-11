export const extractTags = (prompt) => {
  if (!prompt) return [];
  return prompt
    .split(" ")
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, "").toLowerCase())
    .filter((w) => w.length > 2);
};
