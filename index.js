const express = require('express');
const bodyParser = require('body-parser');
const { Client, middleware } = require('@line/bot-sdk');
require('dotenv').config({ path: './config/.env' });

// ตั้งค่า LINE Bot SDK
const client = new Client({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
});

// สร้าง Express Server
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(middleware({ channelSecret: process.env.CHANNEL_SECRET }));
app.use(bodyParser.json());

// รายการรางวัลทั้งหมด
const prizes = [
  'รางวัลที่ 1: iPhone 15',
  'รางวัลที่ 2: MacBook Air',
  'รางวัลที่ 3: iPad Pro',
  'รางวัลที่ 4: หูฟัง AirPods Pro',
  'รางวัลที่ 5: นาฬิกา Apple Watch',
  'รางวัลที่ 6: ลำโพง JBL',
  'รางวัลที่ 7: บัตร Starbucks มูลค่า 1,000 บาท',
  'รางวัลที่ 8: บัตร Central Gift Card มูลค่า 2,000 บาท',
  'รางวัลที่ 9: Power Bank',
  'รางวัลที่ 10: กระเป๋าเป้สุดเท่',
];

// เก็บสถานะผู้เล่นที่สุ่มแล้ว
const usersDrawn = {};

// Webhook Endpoint
app.post('/webhook', async (req, res) => {
  try {
    const events = req.body.events;
    if (!events || events.length === 0) {
      return res.status(200).send('No events received'); // ตอบกลับทันทีหากไม่มี events
    }

    // จัดการแต่ละ event
    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'text') {
        const replyToken = event.replyToken;
        const userMessage = event.message.text.toLowerCase();
        const userId = event.source.userId;

        let message;

        if (userMessage === 'hybrid test') {
          if (usersDrawn[userId]) {
            message = {
              type: 'text',
              text: `คุณเคยสุ่มรางวัลไปแล้ว: ${usersDrawn[userId]} 🎁`,
            };
          } else {
            const availablePrizes = prizes.filter(
              (prize) => !Object.values(usersDrawn).includes(prize)
            );

            if (availablePrizes.length === 0) {
              message = {
                type: 'text',
                text: 'รางวัลทั้งหมดถูกสุ่มออกไปแล้ว 🎉 ขอบคุณที่เข้าร่วมกิจกรรม!',
              };
            } else {
              const randomIndex = Math.floor(Math.random() * availablePrizes.length);
              const prize = availablePrizes[randomIndex];

              usersDrawn[userId] = prize;

              message = {
                type: 'text',
                text: `🎉 ยินดีด้วย! คุณได้รับ: ${prize}`,
              };
            }
          }
        } else {
          message = {
            type: 'text',
            text: 'พิมพ์ "Hybrid TEST" เพื่อเริ่มสุ่มรางวัล!',
          };
        }

        // ตอบกลับข้อความ
        await client.replyMessage(replyToken, message);
      }
    }

    // ตอบกลับ LINE Platform
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});

// ตรวจสอบว่าเซิร์ฟเวอร์ทำงานได้
app.get('/', (req, res) => {
  res.status(200).send('Server is running!');
});

// เริ่มเซิร์ฟเวอร์
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
