const express = require('express');
const bodyParser = require('body-parser');
const { Client, middleware } = require('@line/bot-sdk');
require('dotenv').config({ path: './config/.env' }); // โหลดค่าจาก .env ในโฟลเดอร์ config

// ตั้งค่า LINE Bot SDK
const client = new Client({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN, // อ่านค่าจาก .env
  channelSecret: process.env.CHANNEL_SECRET, // อ่านค่าจาก .env
});

// สร้าง Express Server
const app = express();
const port = process.env.PORT || 3000; // ใช้ค่าจาก .env หรือ 3000

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
app.post('/webhook', (req, res) => {
  const events = req.body.events;
  events.forEach(async (event) => {
    if (event.type === 'message' && event.message.type === 'text') {
      const replyToken = event.replyToken;
      const userMessage = event.message.text.toLowerCase();
      const userId = event.source.userId; // ใช้ userId เพื่อระบุผู้ใช้แต่ละคน

      let message;

      if (userMessage === 'hybrid test') {
        // ตรวจสอบว่าผู้ใช้เล่นไปแล้วหรือยัง
        if (usersDrawn[userId]) {
          message = {
            type: 'text',
            text: `คุณเคยสุ่มรางวัลไปแล้ว: ${usersDrawn[userId]} 🎁`,
          };
        } else {
          // สุ่มรางวัล
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

            // บันทึกสถานะผู้ใช้และรางวัลที่ได้
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

      try {
        await client.replyMessage(replyToken, message);
      } catch (err) {
        console.error('Error replying message:', err);
      }
    }
  });

  // ส่ง status 200 เพื่อยืนยันว่า webhook ทำงานได้
  res.status(200).end();
});

// เริ่มเซิร์ฟเวอร์
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
