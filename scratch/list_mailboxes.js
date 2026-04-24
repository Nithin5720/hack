const { ImapFlow } = require('imapflow');
require('dotenv').config({ path: '.env.local' });

async function main() {
  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    logger: false
  });

  await client.connect();
  const mailboxes = await client.list();
  mailboxes.forEach(m => console.log(m.path));
  await client.logout();
}

main().catch(console.error);
