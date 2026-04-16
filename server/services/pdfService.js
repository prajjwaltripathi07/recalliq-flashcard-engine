const fs = require("fs");
const pdf = require("pdf-parse");
const axios = require("axios");
const FormData = require("form-data");

/**
 * Normal text extraction for standard text-based PDFs
 */
async function extractTextFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return (data.text || "").trim();
}

/**
 * OCR fallback for scanned PDFs using OCR.Space API
 * Add OCR_SPACE_API_KEY in your .env / Render env vars
 */
async function extractTextWithOCR(filePath) {
  const apiKey = process.env.OCR_SPACE_API_KEY;

  if (!apiKey) {
    throw new Error("OCR_SPACE_API_KEY_MISSING");
  }

  const form = new FormData();
  form.append("apikey", apiKey);
  form.append("language", "eng");
  form.append("isOverlayRequired", "false");
  form.append("file", fs.createReadStream(filePath));

  const response = await axios.post("https://api.ocr.space/parse/image", form, {
    headers: form.getHeaders(),
    maxBodyLength: Infinity,
  });

  const result = response.data;

  if (!result || result.IsErroredOnProcessing) {
    throw new Error(
      Array.isArray(result?.ErrorMessage)
        ? result.ErrorMessage.join(", ")
        : "OCR_FAILED"
    );
  }

  const parsedResults = result.ParsedResults || [];
  const text = parsedResults.map((r) => r.ParsedText || "").join("\n").trim();

  return text;
}

/**
 * Smart extraction:
 * 1. Try normal PDF text extraction
 * 2. If text is too short, fallback to OCR
 */
async function extractTextFromPDFSmart(filePath) {
  let extractedText = "";

  try {
    extractedText = await extractTextFromPDF(filePath);
  } catch (err) {
    console.error("Normal PDF extraction failed:", err.message);
  }

  // If good text found, use it
  if (extractedText && extractedText.length > 300) {
    return {
      text: extractedText,
      method: "pdf-parse",
    };
  }

  console.log("Falling back to OCR for scanned PDF...");

  const ocrText = await extractTextWithOCR(filePath);

  return {
    text: ocrText,
    method: "ocr",
  };
}

module.exports = {
  extractTextFromPDF,
  extractTextWithOCR,
  extractTextFromPDFSmart,
};