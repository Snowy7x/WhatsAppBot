// Importing qr-code const qrcode = require('qrcode-terminal');
import * as qrcode from 'qrcode-terminal';
import {Client} from 'whatsapp-web.js';
import LocalAuth from "whatsapp-web.js";
const client = new Client({
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    },
    authStrategy: new LocalAuth.LocalAuth()
});
// Import all the bots
import NewsBot from "./Bots/NewsBot.js";
import HelpBot from "./Bots/HelpBot.js";

// create new Instance of each bot
const newsBot = new NewsBot("News Bot");
const helpBot = new HelpBot("#والتر الأبيض", "#والتر", "120363043060166796@g.us");

client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
    console.log('Scan this QR code in your phone to login');
    newsBot.OnQr(qr);
    helpBot.OnQr(qr);
});

client.on('ready', async () => {
    newsBot.OnReady()
    helpBot.OnReady()
});

client.on('message', (message) => {
    newsBot.OnMessage(message);
    helpBot.OnMessage(message);
})


//test()
client.initialize().then(r =>
    console.log("Whatsapp Web Client is Ready!")
).catch(e => {
    console.log(e);
});