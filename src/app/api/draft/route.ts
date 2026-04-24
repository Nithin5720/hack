import { NextResponse } from "next/server";
import OpenAI from "openai";
import { SYSTEM_PROMPT } from "@/lib/ai-prompts";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy",
});

export async function POST(req: Request) {
  try {
    const { emailBody, senderName, subject, analysis, tone = "professional" } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        draft: `Hi ${senderName},\n\nThank you for your message regarding "${subject}". We have received it and will look into it shortly.\n\nBest regards,\nAI Assistant`,
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Draft a reply to the following email. Keep it ${tone}. Based on our analysis, this is a ${analysis.urgency} urgency ${analysis.category} from a ${analysis.senderType}.\n\nIf information is missing to fulfill the request (like an order ID), ask for it politely.\n\nSender: ${senderName}\nSubject: ${subject}\nBody: ${emailBody}\n\nReturn the response as a JSON object with a single key "draft" containing the text of the email.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return NextResponse.json(result);
  } catch (error) {
    console.error("Draft Error:", error);
    return NextResponse.json({ error: "Failed to generate draft" }, { status: 500 });
  }
}
