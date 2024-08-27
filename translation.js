require('dotenv').config()
const http = require('http');
const OpenAI = require("openai");
const ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const PORT = process.env.PORT;

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




const server = http.createServer((req, res) => {

    if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method Not Allowed');
    }

    let body = '';

    // Collect the data chunks
    req.on('data', chunk => {
      body += chunk.toString(); 

    });

    req.on('end', () => {
        const response = JSON.parse(body)

        translate(response.message)
        .then(gptResponse => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ gptResponse: gptResponse }));
        })
        .catch(error => {
          console.error('Request error:', err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        });


    });

    // Handle errors
    req.on('error', (err) => {
      console.error('Request error:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    });

});


server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});