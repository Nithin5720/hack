import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "src", "data", "emails.json");

export async function GET() {
  try {
    const fileContents = fs.readFileSync(dataFilePath, "utf8");
    const emails = JSON.parse(fileContents);
    // Sort by date descending
    emails.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return NextResponse.json(emails);
  } catch (error) {
    console.error("GET Emails Error:", error);
    return NextResponse.json({ error: "Failed to read emails" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const newEmailData = await req.json();
    
    const fileContents = fs.readFileSync(dataFilePath, "utf8");
    const emails = JSON.parse(fileContents);
    
    const newEmail = {
      id: Date.now().toString(),
      senderName: newEmailData.senderName || "Unknown",
      senderEmail: newEmailData.senderEmail || "unknown@example.com",
      subject: newEmailData.subject || "No Subject",
      body: newEmailData.body || "",
      date: new Date().toISOString(),
      read: false
    };
    
    emails.unshift(newEmail);
    
    fs.writeFileSync(dataFilePath, JSON.stringify(emails, null, 2), "utf8");
    
    return NextResponse.json({ success: true, email: newEmail });
  } catch (error) {
    console.error("POST Emails Error:", error);
    return NextResponse.json({ error: "Failed to save email" }, { status: 500 });
  }
}
