import { CohereClientV2 } from "cohere-ai";
import dotenv from "dotenv";
import { getVideoLink, generatePlaceholderVideoLink } from "./videoService.js";

dotenv.config();

const cohere = new CohereClientV2({
  token: process.env.COHERE_API_KEY,
});

export const generateCourseService = async (prompt) => {
  try {
    console.log("🤖 Generating strict course outline with Cohere (chat API)...");

    const response = await cohere.chat({
      model: "command-xlarge-nightly",
      messages: [
        {
          role: "user",
          content: `Create a JSON course outline for "${prompt}".  

⚠️ Rules:
- 4–6 modules in logical order
- Each module has 3–5 very specific lessons directly related to "${prompt}"
- Do NOT include unrelated or generic lessons
- Keep lesson titles clear (tutorial-like)
- Return only valid JSON in this format:
{
  "title": "Course Title",
  "modules": [
    {
      "moduleTitle": "Module Name",
      "lessons": ["Lesson 1", "Lesson 2"]
    }
  ]
}`
        }
      ],
      temperature: 0.6,
      max_tokens: 800, // ✅ correct field for chat API
    });

    let text = response.output[0].content.trim();
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "");

    let parsedOutline;
    try {
      parsedOutline = JSON.parse(text);
    } catch (err) {
      console.error("⚠️ JSON parse failed:", err.message);
      throw new Error("Invalid Cohere JSON output");
    }

    // Attach YouTube videos
    const modulesWithVideos = await Promise.all(
      parsedOutline.modules.map(async (module) => {
        const lessonsWithVideos = await Promise.all(
          module.lessons.map(async (lessonTitle) => {
            const searchQuery = `${prompt} ${lessonTitle} course tutorial beginner`;
            let video = await getVideoLink(searchQuery);

            if (!video) {
              video = generatePlaceholderVideoLink(`${lessonTitle} ${prompt}`, prompt);
            }

            return { title: lessonTitle, video };
          })
        );

        return {
          moduleTitle: module.moduleTitle,
          lessons: lessonsWithVideos,
        };
      })
    );

    return {
      title: parsedOutline.title,
      modules: modulesWithVideos,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ Course generation with videos failed:", error.message);
    throw error;
  }
};

