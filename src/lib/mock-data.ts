export type Email = {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  body: string;
  date: string;
  read: boolean;
};

export const MOCK_EMAILS: Email[] = [
  {
    id: "1",
    senderName: "Sarah Jenkins",
    senderEmail: "sarah.j@example.com",
    subject: "Missing order from last week",
    body: "Hi team, I placed an order last Tuesday but I haven't received it yet. Can you check what's going on?",
    date: new Date().toISOString(),
    read: false,
  },
  {
    id: "2",
    senderName: "Enterprise Corp Sales",
    senderEmail: "partnerships@enterprisecorp.com",
    subject: "Potential Partnership Opportunity",
    body: "Hello, we are looking for a reliable vendor to supply our 50 regional offices. Are you available for a brief call next week to discuss potential pricing tiers and SLAs?",
    date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false,
  },
  {
    id: "3",
    senderName: "David Lee",
    senderEmail: "d.lee.1990@gmail.com",
    subject: "Quick question about the pro plan",
    body: "Hey there! I'm currently on the basic plan and considering upgrading. Does the pro plan include priority 24/7 support? Thanks, David.",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
  },
  {
    id: "4",
    senderName: "Crypto King",
    senderEmail: "admin@cryptosuperx.io",
    subject: "URGENT: Claim your free tokens NOW",
    body: "You have been selected to receive 10,000 SuperX tokens! Click here immediately to claim before the pool runs out.",
    date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    read: true,
  },
];
