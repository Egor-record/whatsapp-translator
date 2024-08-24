const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const OpenAI = require("openai");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ai = new OpenAI({ apiKey: OPENAI_API_KEY });

const client = new Client();

const translate = (msgBody) => {
    return new Promise((resolve, reject) => {
        console.log("inside promise");

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
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', msg => {

    if (msg.from !== process.env.MY_PHONE + '@c.us') return

    translate(msg.body)
    .then(gptResponse => {
        client.sendMessage(msg.from, gptResponse);
    })
    .catch(error => {
        client.sendMessage(msg.from, 'Error during translation :(');
        console.error("Error during translation:", error);
    });

    
});


client.initialize();