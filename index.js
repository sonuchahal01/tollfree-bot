const TelegramBot = require('node-telegram-bot-api');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// ✅ Your Bot Token
const token = '8124994370:AAFy-obY-8jXdMNc5_cwnelQj3Bku-O2JdQ';

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  const welcomeMessage = `👋 Welcome to Toll-Free Helper Bot!

🔍 Type any company/brand name like:
• flipkart
• sbi
• airtel

And I’ll send you their toll-free number.`;
  bot.sendMessage(msg.chat.id, welcomeMessage);
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.toLowerCase()?.trim();

  if (text.startsWith('/')) return;

  try {
    const snapshot = await db.collection('tollfree').where('brand', '==', text).get();

    if (snapshot.empty) {
      await bot.sendMessage(chatId, `❌ Sorry, no toll-free info found for "${text}". Try another brand.`);
    } else {
      snapshot.forEach(async (doc) => {
        const data = doc.data();
        const reply = `📞 Toll-Free: ${data.number || 'N/A'}\n📧 Email: ${data.email || 'N/A'}\n🏷️ Category: ${data.category || 'N/A'}`;
        await bot.sendMessage(chatId, reply);
      });
    }
  } catch (err) {
    console.error(err);
    await bot.sendMessage(chatId, '⚠️ Something went wrong. Please try again later.');
  }
});
