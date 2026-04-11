import { CohereClient } from "cohere";

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY, // ensure it's in .env
});

export const generateCourse = async (prompt) => {
  const response = await cohere.generate({
    model: "command-r",
    prompt: `
      Create a detailed course structure for the topic "${prompt}".
      Output only valid JSON in the following format:
      {
        "courseTitle": "...",
        "shortDescription": "...",
        "modules": [
          {
            "moduleTitle": "...",
            "lessons": ["Lesson 1", "Lesson 2"]
          }
        ]
      }
    `,
    max_tokens: 500,
    temperature: 0.7,
  });

  let course;
  try {
    course = JSON.parse(response.generations[0].text.trim());
  } catch (err) {
    console.error("❌ Failed to parse JSON:", err.message);
    return null;
  }

  return course;
};
