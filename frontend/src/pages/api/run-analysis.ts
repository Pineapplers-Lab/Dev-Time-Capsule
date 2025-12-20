import type { NextApiRequest, NextApiResponse } from "next";

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (!API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not set in environment variables" });
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { repoUrl, manifestContent } = req.body;

        if (!repoUrl && !manifestContent) {
            return res.status(400).json({ error: "Missing repoUrl or manifestContent" });
        }

        const promptContext = manifestContent
            ? `the provided manifest content: \n\n${manifestContent}`
            : `this repository URL: ${repoUrl}`;

        const systemPrompt = `You are an expert Onboarding Mentor. Return JSON ONLY with the following structure:
{
  "projectName": "string",
  "stackDescription": "string",
  "stackDetails": [{ "name": "string", "purpose": "string" }],
  "onboarding": { "installCmd": "string", "testCmd": "string", "runCmd": "string" },
  "vulnerabilities": [{ "issue": "string", "riskLevel": "Low|Medium|High", "fix": "string" }],
  "advisory": [{ "title": "string", "explanation": "string", "recommendation": "string" }],
  "learningSources": [{ "title": "string", "url": "string", "description": "string" }]
}`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: `Onboard me to: ${promptContext}` }] }],
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                    generationConfig: { responseMimeType: "application/json" },
                }),
            }
        );

        if (!response.ok) {
            const text = await response.text();
            return res.status(response.status).json({ error: text });
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            return res.status(500).json({ error: "No response content from Gemini" });
        }

        // Try to parse JSON safely
        try {
            const json = JSON.parse(text);
            return res.status(200).json(json);
        } catch {
            return res.status(500).json({ error: "Invalid JSON returned from Gemini", raw: text });
        }
    } catch (err: any) {
        return res.status(500).json({ error: err.message || "Unknown error" });
    }
}
