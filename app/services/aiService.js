const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

class AIService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY missing in .env");
    }

    // Init Gemini client
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      useApplicationDefaultCredentials: false,
    });

    // Default model
    this.model = "gemini-2.5-flash";
  }

  async classifyIntent(lead, offer) {
    try {
      const prompt = this.buildPrompt(lead, offer);

      const result = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt,
      });

      // ✅ Extract text safely 
      const text =
        result?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "INTENT: Low\nREASONING: No valid AI output";

      return this.parseAIResponse(text);
    } catch (error) {
      console.error("AI classification error:", error.message);
      return {
        score: 10,
        intent: "Low",
        reasoning: "AI classification failed, defaulting to Low intent",
      };
    }
  }

  buildPrompt(lead, offer) {
    return `
You are an expert sales qualification AI. Analyze the following lead and product offer to determine buying intent.

PRODUCT/OFFER DETAILS:
- Name: ${offer.name}
- Value Propositions: ${offer.value_props.join(", ")}
- Ideal Use Cases: ${offer.ideal_use_cases.join(", ")}

LEAD INFORMATION:
- Name: ${lead.name}
- Role: ${lead.role}
- Company: ${lead.company}
- Industry: ${lead.industry}
- Location: ${lead.location}
- LinkedIn Bio: ${lead.linkedin_bio || "Not provided"}

ANALYSIS CRITERIA:
1. Role Authority: Does this person have decision-making power or influence?
2. Industry Fit: Does their industry align with the product's ideal use cases?
3. Company Size: Is this likely a target company size?
4. Profile Completeness: Does their profile suggest they're actively seeking solutions?
5. Pain Point Alignment: Does their role/industry likely face problems this product solves?

RESPONSE FORMAT:
Classify the buying intent as High, Medium, or Low and provide a brief 1-2 sentence explanation.

Your response should be in this exact format:
INTENT: [High/Medium/Low]
REASONING: [1-2 sentence explanation]
`;
  }

  parseAIResponse(response) {
    try {
      const lines = response
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      let intent = "Low";
      let reasoning = "Unable to parse AI response";

      for (const line of lines) {
        if (line.startsWith("INTENT:")) {
          const match = line.match(/INTENT:\s*(High|Medium|Low)/i);
          if (match) intent = match[1];
        } else if (line.startsWith("REASONING:")) {
          reasoning = line.replace("REASONING:", "").trim();
        }
      }

      const scoreMap = { High: 50, Medium: 30, Low: 10 };
      return { score: scoreMap[intent] || 10, intent, reasoning };
    } catch (err) {
      console.error("Parse AI response error:", err);
      return {
        score: 10,
        intent: "Low",
        reasoning: "Error parsing AI response",
      };
    }
  }

  async testConnection() {
    try {
      const result = await this.ai.models.generateContent({
        model: this.model,
        contents: "Hello, are you working?",
      });

      const text =
        result?.candidates?.[0]?.content?.parts?.[0]?.text || null;

      return !!text;
    } catch (err) {
      console.error("AI service test failed:", err.message);
      return false;
    }
  }
}

module.exports = new AIService();
