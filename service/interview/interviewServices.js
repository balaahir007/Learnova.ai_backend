import { CohereClientV2 } from "cohere-ai";

// Use the constructor — don't use cohere.init()
const cohere = new CohereClientV2({
  token: "5aF79545y5cPYXObzxgYC9haRvfua9ZtHWa56B6P", // your Cohere API key
});

export const formGenerateQuestions = async (formData) => {
  const { domain, type, experience, timer, questionAmount, level } = formData;

  if (!domain || !type || !experience || !timer || !questionAmount || !level) {
    throw new Error("All fields required to start interview.");
  }

  console.log("Form Data in Service:", formData);

  const prompt = `
Generate exactly ${questionAmount} ${level} level interview questions for the role of ${domain}.
Experience level: ${experience} years.
Focus on ${type} type of questions (technical, behavioral, or mixed).
All questions should be answerable within a total of ${timer} minutes.
Return ONLY a JSON array like ["Question 1", "Question 2", "Question 3"].
Do NOT include any explanations, numbering, or extra text.
Output must be a valid JSON array.
`;

  try {
    const response = await cohere.chat({
      model: "command-a-03-2025",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const rawJsonText = response.message.content[0].text;
    const questions = JSON.parse(rawJsonText);

    // Validate the response format
    if (!Array.isArray(questions) || questions.length !== questionAmount) {
      throw new Error("Invalid response format from Cohere AI");
    }

    console.log(Array.isArray(questions), questions.length, questionAmount);
    console.log("Response from Cohere:", questions);
    return questions;
  } catch (error) {
    throw new Error(error.message || "Error generating questions");
  }
};

export const resumeGenerateQuestions = async (
  resumeExtractedText,
  formData
) => {
  const { type, timer, questionAmount, level } = formData;
  console.log("Form Data:", formData);

  if (!type || !timer || !questionAmount || !level) {
    throw new Error("All fields required to start interview.");
  }

  const prompt = `
You are an expert technical interviewer.

Based on the extracted resume text below, generate exactly ${questionAmount} ${level}-level interview questions.

Resume Text:
${resumeExtractedText}

Focus on ${type} type questions (technical, behavioral, or mixed).

Guidelines:
- Ensure questions are strictly relevant to the resume's skills, experience, and projects.
- Keep them concise and clear.
- All ${questionAmount} questions must be answerable in ${timer} minutes total.
- Format your response as a pure JSON array of strings only.

✅ Example output:
["What project did you build using React?", "Explain your role in the XYZ internship project.", "How do you approach debugging in JavaScript?"]

❌ Do NOT include any explanations, formatting, or extra text.
❌ No numbering or bullet points.

Output must be a valid JSON array only.
`;

  try {
    const response = await cohere.chat({
      model: "command-a-03-2025",
      messages: [
        {
          role: "user",
          content: prompt.trim(),
        },
      ],
    });

    const rawText = response.message.content[0].text.trim();
    console.log("Raw Cohere Response:", rawText);

    // Validate and parse the JSON array
    const questions = JSON.parse(rawText);

    if (
      !Array.isArray(questions) ||
      questions.length !== Number(questionAmount)
    ) {
      throw new Error("Invalid response format from Cohere AI");
    }
    console.log("Is array:", Array.isArray(questions)); // true or false
    console.log("Questions length:", questions.length); // should be 10
    console.log("Questions preview:", questions); // shows full array

    return questions;
  } catch (error) {
    console.error("Error while generating questions:", error);
    throw new Error(error.message || "Error generating questions");
  }
};

// Note: If you get ENOENT errors for other files (like 05-versions-space.pdf),
// check your tests or other scripts for hardcoded file paths and fix/remove them.
