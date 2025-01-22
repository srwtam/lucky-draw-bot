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

// Webhook Endpoint
app.post('/webhook', (req, res) => {
  const events = req.body.events;
  events.forEach(async (event) => {
    if (event.type === 'message' && event.message.type === 'text') {
      const replyToken = event.replyToken;
      const userMessage = event.message.text.toLowerCase();

      let message;
      if (userMessage === 'start') {
        const winner = Math.random() < 0.5 ? 'User1' : 'User2';
        message = { type: 'text', text: `🎉 ยินดีด้วย! ผู้ชนะคือ: ${winner}` };
      } else {
        message = { type: 'text', text: 'พิมพ์ "start" เพื่อเริ่ม Lucky Draw!' };
      }

      try {
        await client.replyMessage(replyToken, message);
      } catch (err) {
        console.error(err);
      }
    }
  });

  res.status(200).end();
});

// เริ่มเซิร์ฟเวอร์
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
