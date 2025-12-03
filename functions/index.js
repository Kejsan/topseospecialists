
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");

admin.initializeApp();

const GEMINI_API_KEY = functions.config().gemini.key;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

exports.enrichProfile = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const { specialistName, specialistRole } = data;
  if (!specialistName || !specialistRole) {
    throw new functions.https.HttpsError("invalid-argument", "The function must be called with two arguments: 'specialistName' and 'specialistRole'.");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      Find the professional website and one primary social media profile (like LinkedIn or Twitter) for an SEO specialist. Also, write a brief, one-sentence professional summary for them.

      **Name:** "${specialistName}"
      **Role/Company:** "${specialistRole}"

      Return the information in a JSON object with the following keys: "website", "social", "summary".
      If you cannot find a specific piece of information, return null for that key.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    // Clean the response to ensure it's valid JSON
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const enrichedData = JSON.parse(cleanedText);

    return enrichedData;

  } catch (error) {
    console.error("Error enriching profile:", error);
    throw new functions.https.HttpsError("internal", "Error enriching profile.", error);
  }
});
