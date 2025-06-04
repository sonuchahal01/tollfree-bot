const TelegramBot = require('node-telegram-bot-api');
const admin = require('firebase-admin');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Firebase service account key (from secret file)
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Telegram Bot Token from environment variable
const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Root route for UptimeRobot ping
app.get('/', (req, res) => {
  res.send('✅ Bot is alive and running!');
});

// Start server for Render to detect
app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});

// Start command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, `👋 Welcome to Toll-Free Bot!\n\nType any brand name like:\n🛍️ flipkart\n📱 airtel\n🏦 sbi\nAnd I'll fetch the toll-free number.`);
});

// Text message handler
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
