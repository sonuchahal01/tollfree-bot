const TelegramBot = require('node-telegram-bot-api');
const admin = require('firebase-admin');
const serviceAccount = require('/etc/secrets/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

const token = '💬 YAHAN_APNA_BOT_TOKEN_DALO';
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, `👋 Welcome to Toll-Free Bot!
\n\nType any brand name like:
🛒 flipkart
📱 airtel
🏦 sbi

And I'll fetch the toll-free number.`);
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text.toLowerCase().trim();

  if (text === '/start') return;

  try {
    const doc = await db.collection('tollfree').doc(text).get();
    if (!doc.exists) {
      await bot.sendMessage(chatId, `❌ Sorry, no toll-free info found for "${text}". Try another brand.`);
    } else {
      const data = doc.data();
      const reply = `📞 Toll-Free: ${data.number || 'N/A'}\n📧 Email: ${data.email || 'N/A'}\n🏷️ Category: ${data.category || 'N/A'}`;
      await bot.sendMessage(chatId, reply);
    }
  } catch (err) {
    console.error(err);
    await bot.sendMessage(chatId, '⚠️ Something went wrong. Please try again later.');
  }
});

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('✅ Bot is alive and running.');
});
app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});
