import { NextResponse } from "next/server";
import { ImapFlow } from "imapflow";
import nodemailer from "nodemailer";
import { simpleParser } from "mailparser";

// Helper to disable TLS strict authorization for development/hackathon purposes if needed
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function GET() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    return NextResponse.json({ error: "Email credentials not configured." }, { status: 500 });
  }

  const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: { user, pass },
    logger: false,
  });

  try {
    await client.connect();
    let lock = await client.getMailboxLock('INBOX');
    
    const emails = [];
    try {
      const totalMessages = client.mailbox.exists;
      if (totalMessages > 0) {
        // Fetch up to the last 15 emails
        const fetchRange = `${Math.max(1, totalMessages - 14)}:*`;
        for await (let message of client.fetch(fetchRange, { envelope: true, source: true })) {
          if (message.source) {
            const parsed: any = await simpleParser(message.source);
            emails.push({
              id: message.uid.toString(),
              senderName: parsed.from?.value[0]?.name || parsed.from?.value[0]?.address || "Unknown",
              senderEmail: parsed.from?.value[0]?.address || "unknown@example.com",
              subject: parsed.subject || "No Subject",
              body: parsed.text || "No Content",
              date: parsed.date ? new Date(parsed.date).toISOString() : new Date().toISOString(),
              read: message.flags.has('\\Seen'),
            });
          }
        }
      }
    } finally {
      lock.release();
    }
    
    await client.logout();
    
    // Sort descending by date
    emails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return NextResponse.json(emails);
  } catch (error: any) {
    console.error("GET Emails Error:", error);
    return NextResponse.json({ error: "Failed to read emails from Gmail. Check your App Password." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    return NextResponse.json({ error: "Email credentials not configured." }, { status: 500 });
  }

  try {
    const { to, subject, body } = await req.json();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });

    const info = await transporter.sendMail({
      from: `"Bionic Inbox" <${user}>`,
      to,
      subject,
      text: body,
    });

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error("POST Emails Error:", error);
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }
}
