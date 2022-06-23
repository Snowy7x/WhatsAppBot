const rwClient = require("./twitterClient")
const qrcode = require('qrcode-terminal');
var cron = require('node-cron');

const {Client, LocalAuth, MessageMedia} = require('whatsapp-web.js');
const client = new Client({
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    },
    authStrategy: new LocalAuth()
});

const chatID = '120363040300373530@g.us';
const form = `
─━── 「خبر」─━──
{text}
─━─「⊱𝑨𝒊𝒓𝒆𝒔 𖡹 𝑵𝒆𝒘𝒔📬」─━─
اللقب:|- اللقب
`

client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', async () => {
    console.log('Client is ready!');
});

client.on('message', (message) => {
    if (message.body.includes("this chat id?")) {
        message.getChat().then(chat => {
            console.log(chat.name);
            console.log(chat.id._serialized);
            message.reply("This chat is " + chat.name);
            message.reply("This chat id is " + chat.id._serialized);
        })
    }
})


const get5Tweets = async (id) => {
    const tweets = [];
    let timeLine = await rwClient.v2.userTimeline(id, {
        expansions: ['attachments.media_keys', 'attachments.poll_ids', 'referenced_tweets.id'],
        'media.fields': ['url'],
    });

    // get 5 tweets
    let i = 0;
    for await (const tweet of timeLine) {
        if (i < 5) {
            let mediaUrls = [];
            const medias = timeLine.includes.medias(tweet);
            const poll = timeLine.includes.poll(tweet);

            if (medias.length) {
                // push media urls to array
                for (const media of medias) {
                    mediaUrls.push(media.url);
                }
            }

            tweets.push({
                text: tweet.text,
                attachments: {
                    username: tweet.author_id,
                    accountId: id,
                    media_keys: mediaUrls,
                    poll_ids: poll ? [poll.id] : [],
                    media_urls: mediaUrls,
                }
            });
            i++;
        } else {
            break;
        }
        /*const medias = timeLine.includes.medias(tweet);
        const poll = timeLine.includes.poll(tweet);

        if (medias.length) {
          console.log('This tweet contains medias! URLs:', medias.map(m => m.url));
        }
        if (poll) {
          console.log('This tweet contains a poll! Options:', poll.options.map(opt => opt.label));
        }

        tweets.push(tweet);*/
    }
    return tweets;
}

const refreshTweets = async () => {
    let newTweets = [];
    for (let i = 0; i < accountIds.length; i++) {
        const accountId = accountIds[i];
        console.log('refreshing for: ' + accountId);
        const tweets = await get5Tweets(accountId);
        // check if there are new tweets
        for (let j = 0; j < tweets.length; j++) {
            const tweet = tweets[j];
            const lastTweet = lastTweets[i] ? lastTweets[i][j] : null;
            console.log(lastTweet);
            if (tweet.text !== lastTweet?.text) {
                newTweets.push(tweet);
            }
        }
        lastTweets.push(tweets);
    }
    return newTweets;
}

const accountIds = [
    '3095710434', // @Crunchyroll_ar
    '2877858389', // @xotakuAN
    '3308605272', // @ASCom0
    '239960634', // @Ahmedm94m
    '1335557059', // @EMUNOPLA
    '1021359660501291008', // @AnimeNews360
    '715966460049432577', // @AnimeTherapy
    '1102366975572013057' // @An1meMaster
]


let lastTweets = [];


cron.schedule('* *!/2 * * *', async () => {
    console.log('Refreshing tweets...');
    // get new tweets
    const newTweets = await refreshTweets();
    // send new tweets
    for (let i = 0; i < newTweets.length; i++) {
        const tweet = newTweets[i];
        // send the tweet media
        if (tweet.attachments.media_keys.length
        && tweet.attachments.media_urls[0] !== undefined) {
            const media = await MessageMedia.fromUrl(tweet.attachments.media_urls[0]);
            await client.sendMessage(chatID, form.replace('{text}', tweet.text), {
                media
            });
        }else {
            // send the tweet text
            const formatted = form.replace('{text}', tweet.text);
            const message = new MessageMedia(formatted, 'text/plain');
            await client.sendMessage(chatID, message);
        }
    }
});


//test()
client.initialize();