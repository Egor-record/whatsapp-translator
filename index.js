require('dotenv').config()
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');


const client = new Client({
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  }
});

const WHITELIST = [
    process.env.MY_PHONE + '@c.us',
    process.env.EVA + '@c.us',
    process.env.IMKE + '@c.us',
    process.env.BAS + '@c.us',
    process.env.JENSKE + '@c.us',
    process.env.JAN + '@c.us',
    process.env.JEANINE + '@c.us'
];

const PORT = process.env.PORT;

client.on('qr', (qr) => {
    console.log("QR Code")
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
  console.log('Client is ready!');
});

client.on('disconnected', () => {
  console.log('Client is disconnected!');
});

client.on('authenticated', () => {
  console.log('Client is authenticated!');
});

client.on('auth_failure', () => {
  console.log('Client is auth_failure!');
});

client.on('message', msg => {

    if (!WHITELIST.includes(msg.from)) return;

    const fetch = require('node-fetch');

    fetch(process.env.IP + ':' + PORT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: msg.body
      })
    })
    .then(response => response.json())
    .then(data => {
      client.sendMessage(msg.from, data.gptResponse);
      console.log('Response:', data.gptResponse);
    })
    .catch(error => {
      console.error('Request Error:', error);
    });


});


client.initialize();