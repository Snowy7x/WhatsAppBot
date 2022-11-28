const fs = require("fs");
const {MessageMedia} = require("whatsapp-web.js");
const mime = require('mime-types');

const SendSticker = async (message, client) => {
    if (message.hasMedia) {
        message.reply("خلني اشوف...")
        message.downloadMedia().then(media => {
            if (media) {
                const mediaPath = './downloads/';

                if (!fs.existsSync(mediaPath)) {
                    fs.mkdirSync(mediaPath);
                }


                const extension = mime.extension(media.mimetype);

                const filename = new Date().getTime();

                const fullFilename = mediaPath + filename + '.' + extension;

                // Save to file
                try {
                    fs.writeFileSync(fullFilename, media.data, {encoding: 'base64'});
                    MessageMedia.fromFilePath(fullFilename)
                    client.sendMessage(message.from, new MessageMedia(media.mimetype, media.data, filename.toString()), {
                        sendMediaAsSticker: true, stickerAuthor: "Jarvis",
                        stickerName: "Aires"
                    }).then(() => {
                        message.reply("يلا خذ استمتع")
                    }).catch(err => {
                        console.log("Did not do the file cause: " + err)
                    })
                    fs.unlinkSync(fullFilename)
                } catch (err) {
                    console.log("Did not do the file cause: " + err)
                    message.reply("احم مدري وش صار بس ما قدرت اسويه...")
                }
            }
        }).catch(err => {
            console.log("Did not download cause: " + err)
        });
    }else{
        message.reply("حط صورة/فيديو مع الرسالة يا غبي")
    }
}

const Kick = async (message, client = null) => {
    await message.getChat().then(async chat => {
        await message.getContact().then(async contact => {
            if (IsAdmin(chat, message.author)) {
                await message.getMentions().then(async contacts => {
                    if (contacts.length > 0) {
                        if (contacts[0].isMe || contacts[0].number.includes("74479336") || contacts[0].number.includes("30446848")) {
                            message.reply("ما تقدر تطرده :)")
                            return;
                        }
                        await chat.removeParticipants([contacts[0].id._serialized]).then(
                            () => {
                                message.reply("غادر كلب المجموعه")
                            }
                        ).catch(err => {
                            message.reply("همممم مدري وش صار غلط بس مقدرت اطرده.")
                        })
                    } else {
                        message.reply("منشن شخص يا عثل")
                    }
                })
            } else {
                message.reply(`The kick command can only be used by group admins.`);
            }
        })
    });
}

const IsAdmin = (chat, authorId) => {
    for (let participant of chat.participants) {
        if (participant.id._serialized === authorId) {
            return participant.isAdmin;
        }
    }
}

module.exports ={SendSticker, Kick, IsAdmin};