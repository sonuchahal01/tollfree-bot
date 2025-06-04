require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const query = msg.text.toLowerCase().trim();

  try {
    const snapshot = await db.collection('tollfree').where('name', '==', query).get();
    if (snapshot.empty) {
      bot.sendMessage(chatId, `❌ Sorry, no toll-free info found for "${query}". Try another brand.`);
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      const message = `📞 Toll-Free: ${data.number}\n📧 Email: ${data.email}\n🏷️ Category: ${data.category}`;
      bot.sendMessage(chatId, message);
    });
  } catch (error) {
    console.error('❗ Error:', error);
    bot.sendMessage(chatId, '⚠️ Internal error. Please try again later.');
  }
});
