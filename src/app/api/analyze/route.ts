import { NextResponse } from "next/server";
import OpenAI from "openai";
import { SYSTEM_PROMPT } from "@/lib/ai-prompts";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy",
});

export async function POST(req: Request) {
  try {
    const { emailBody, senderName, subject } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      // Return mock data if no key is provided for the hackathon demo
      console.warn("No OPENAI_API_KEY found, returning mock analysis");
      return NextResponse.json({
        intent: "query",
        urgency: "medium",
        category: "Support Requests",
        senderType: "customer",
        summary: "The user is asking a question.",
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Analyze the following email and return a JSON object with keys: "intent", "urgency", "category", "senderType", "summary".\n\nSender: ${senderName}\nSubject: ${subject}\nBody: ${emailBody}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return NextResponse.json(result);
  } catch (error) {
    console.error("Analysis Error:", error);
    return NextResponse.json({ error: "Failed to analyze email" }, { status: 500 });
  }
}
