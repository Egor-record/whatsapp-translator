require('dotenv').config()
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const OpenAI = require("openai");
const ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const client = new Client({
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
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

const translate = (msgBody) => {
    return new Promise((resolve, reject) => {

        const request = {
            model: 'gpt-3.5-turbo',
            temperature: 0,
            max_tokens: 500,
            messages: [{
                content: `I have a sentence ${msgBody}. If it's on Dutch language translate it to English. If it's on English translate it to Dutch. Print only translation`,
                role:  "user"
            }]
        };

        ai.chat.completions.create(request)
            .then(gptResponse => {
                resolve(gptResponse.choices[0].message.content);
            })
            .catch(error => {
                reject(error);
            });
    });
}

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

    console.log(msg)

    if (!WHITELIST.includes(msg.from)) return;

    translate(msg.body)
    .then(gptResponse => {
        client.sendMessage(msg.from, gptResponse);
    })
    .catch(error => {
        client.sendMessage(msg.from, 'Error during translation :(');
        console.error("Error during translation:", error);
    });

});

console.log("Starting process!")
client.initialize();