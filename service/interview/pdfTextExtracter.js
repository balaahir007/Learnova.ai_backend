import fs from "fs";
import pdf from "pdf-parse";

const parsePdfBuffer = async (input) => {
  try {
    let dataBuffer;
    if (Buffer.isBuffer(input)) {
      dataBuffer = input;
    } else if (typeof input === "string" && fs.existsSync(input)) {
      dataBuffer = fs.readFileSync(input);
    } else {
      throw new Error("Invalid input: must be a buffer or valid file path");
    }
    const data = await pdf(dataBuffer);
    console.log("Pages:", data.numpages);
    if (data.numpages > 2) {
      throw new Error("Your Resume should not be greater than 2 pages");
    }
    const extractedText = data.text;
    if (!extractedText || extractedText.trim() === "") {
      throw new Error(
        "This PDF seems to be image-based or canvas-rendered. Please upload a text-based PDF resume."
      );
    }

    console.log("Text:", extractedText); // This displays the extracted text
    return extractedText;
  } catch (error) {
    throw new Error(error.message || "Error generating questions");
  }
};

export default parsePdfBuffer
