const fs = require('fs');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');
const admin = require('firebase-admin');

// 🔐 Decode FIREBASE_CREDENTIALS from base64 and write to a temp file
const serviceAccountPath = path.join(__dirname, 'tempServiceAccountKey.json');
fs.writeFileSync(serviceAccountPath, Buffer.from(process.env.FIREBASE_CREDENTIALS, 'base64'));

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath))
});

const db = admin.firestore();
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const brandQuery = msg.text.trim().toLowerCase();

  try {
    const snapshot = await db.collection('tollfree')
      .where('brand', '==', brandQuery)
      .get();

    if (snapshot.empty) {
      await bot.sendMessage(chatId, `❌ Sorry, no toll-free info found for "${brandQuery}". Try another brand.`);
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      const message = `📞 *Toll-Free:* ${data.number}\n📧 *Email:* ${data.email}\n🏷 *Category:* ${data.category}`;
      bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    bot.sendMessage(chatId, '❌ Error fetching toll-free info.');
  }
});
