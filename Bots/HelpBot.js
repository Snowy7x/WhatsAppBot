//import Bot from "./Bot.js";
const Bot = require("./Bot.js");
//import * as fs from "fs";
const fs = require("fs");
const {MessageMedia} = require("whatsapp-web.js");
const mime = require('mime-types');

const kickCmds = ["#kick", "#ban", "#طرد", "#كيك"]
Array.prototype.random = function () {
    return this[Math.floor((Math.random()*this.length))];
}
module.exports = class HelpBot extends Bot {
    constructor(name, prefix = "", workChannelID = "") {
        super(name, prefix);
        // Check if messages file exists
        if (fs.existsSync(`./Bots/${name}/messages.json`)) {
            let rawDara = fs.readFileSync(`./Bots/${name}/messages.json`);
            this.config = JSON.parse(rawDara);
        } else {
            // Create messages file and folder
            fs.mkdirSync(`./Bots/${name}`);
            fs.writeFileSync(`./Bots/${name}/messages.json`, JSON.stringify({
                commands: []
            }));
            let rawDara = fs.readFileSync(`./Bots/${name}/messages.json`);
            this.config = JSON.parse(rawDara);
        }

        this.nextQueue = [];
        this.workChannelID = workChannelID;
        this.customCommands = []

    }

    OnQr(qr) {

    }

    OnReady() {
        console.log(`${this.name} bot is Ready!`);
    }

    async OnMessage(message, client = null) {
        const parts = message.body.split(" ");
        if (kickCmds.includes(parts[0])){
            await this.Kick(message, client);
            return;
        }
        if (message.body.startsWith(this.prefix) || this.IsInNextQueue(message.author)) {
            message.getChat().then(async chat => {
                if (chat.id._serialized === this.workChannelID) {
                    if (message.body === this.name || message.body === this.prefix) {
                        console.log(`${message.body} command is executed!!`);
                        message.reply(this.GetCommandMessage(this.prefix));
                        return;
                    }

                    if (this.IsInNextQueue(message.author)) {
                        console.log(this.nextQueue);
                        console.log(`${message.body} next is executed! for: ` + this.nextQueue.find(x => x.author === message.author).command);
                        let msg = this.GetNextCommandMessage(this.GetNextQueueCommand(message.author), message.body);
                        if (msg !== "") {
                            message.reply(msg);
                            // remove from queue
                            this.RemoveFromNextQueue(message.author);
                            return;
                        }
                    }

                    let commandName = message.body.split(" ")[1];
                    let args = message.body.split(" ")
                    args.splice(0, 2)
                    console.log(`${commandName} command is executing!`);

                    if (this.IsCustomCmd(commandName)){
                        console.log("custom command")
                        await this.customCommands[commandName].callback(args, message, chat, client)
                        return;
                    }

                    let command = this.GetCommand(commandName);

                    if (command) {
                        if (command.isSticker) {
                            await this.SendSticker(message, client)
                        }else {
                            if (!command.hasNext && !command.hasSub) {
                                message.reply(command.message);
                            } else {
                                if (command.hasNext) {
                                    message.reply(command.message);
                                    // wait for 3 seconds
                                    setTimeout(() => {
                                        message.reply(command.list);

                                        // add the contact to the next list and the command to the next queue
                                        this.nextQueue.push({
                                            author: message.author,
                                            command: commandName
                                        })
                                    }, 3000);
                                }
                            }
                        }
                    }else{
                        message.reply(["وش أسويلك؟", "اها سو؟", "هممممم", "جرب تشوف المينيو #جارفيس", "سو..."].random())
                    }
                }
            })
        }else{
        }
    }

    SetCommandDefaults(options, defaults) {
        return _.defaults({}, _.clone(options), defaults)
    }

    AddCustomCommand(command, callback){
        if (this.IsCommand(command) || this.IsCustomCmd(command)) {
            return console.log("Command: " + command + " has been added already");
        }
        this.customCommands = {
            [command]: {
                command: command,
                callback: callback
            }, ...this.customCommands
        }
    }

    IsCustomCmd(command){
        return this.customCommands[command] !== undefined;
    }

    AddCommand2(options) {
        // Check if command already exists
        options = this.SetCommandDefaults(options, {
            command: "",
            message: "",
            hasSub: false,
            hasNext: false,
            sub: [],
            next: [],
            list: "",
            isSticker: false,
        })
        if (this.IsCommand(command)) {
            return;
        }
        // Add the command using the command as the key and the message as the value
        /*
          [CommandName]:
            message: string
            hasSub: boolean
            hasNext: boolean
            sub: array of strings
            next: {
                [NextCommandName]:{
                    command: string,
                    message: string
               }
            list: string
         */
        this.config.commands = {
            [command]: {
                command: command,
                message: message,
                hasSub: hasSub,
                hasNext: hasNext,
                sub: sub,
                next: next,
                list: list,
                isSticker: isSticker
            },
            ...this.config.commands
        };
        fs.writeFileSync(`./Bots/${this.name}/messages.json`, JSON.stringify(this.config));
    }

    AddCommand(command, message, hasSub = false, hasNext = false, sub = [], next = [], list = "", isSticker = false, overwrite = true) {
        // Check if command already exists
        if (this.IsCommand(command) && !overwrite) {
            return;
        }
        // Add the command using the command as the key and the message as the value
        /*
          [CommandName]:
            message: string
            hasSub: boolean
            hasNext: boolean
            sub: array of strings
            next: {
                [NextCommandName]:{
                    command: string,
                    message: string
               }
            list: string
         */
        this.config.commands = {
            [command]: {
                command: command,
                message: message,
                hasSub: hasSub,
                hasNext: hasNext,
                sub: sub,
                next: next,
                list: list,
                isSticker: isSticker
            },
            ...this.config.commands
        };
        fs.writeFileSync(`./Bots/${this.name}/messages.json`, JSON.stringify(this.config));
    }

    GetCommand(command) {
        return this.config.commands[command];
    }

    GetCommandMessage(command) {
        let message = this.GetCommand(command);
        if (message) {
            return message.message;
        }
        return "";
    }

    RemoveCommand(command) {
        this.config.commands = this.config.commands.filter(m => m.command !== command);
        fs.writeFileSync(`./Bots/${this.name}/messages.json`, JSON.stringify(this.config));
    }

    GetCommands() {
        return this.config.commands;
    }

    IsCommand(message) {
        return this.config.commands[message] !== undefined;
    }

    AddNextCommand(command, nextCommand, message) {
        let commandMessage = this.GetCommand(command);
        if (commandMessage) {
            commandMessage.next.push({
                command: nextCommand,
                message: message
            });
            fs.writeFileSync(`./Bots/${this.name}/messages.json`, JSON.stringify(this.config));
        }
    }

    GetNextCommands(command) {
        let commandMessage = this.GetCommand(command);
        if (commandMessage) {
            return commandMessage.nextCommand;
        }
        return [];
    }

    GetNextCommand(command, nextCommand) {
        let commandMessage = this.GetCommand(command);
        if (commandMessage) {
            return commandMessage.next.find(m => m.command === nextCommand);
        }
        return null;
    }

    GetNextCommandMessage(command, nextCommand) {
        let commandMessage = this.GetNextCommand(command, nextCommand);
        if (commandMessage) {
            return commandMessage.message;
        }
        return "";
    }

    IsInNextQueue(author) {
        // check if nextQueue is json
        if (this.nextQueue.length > 0) {
            // check if the author is in the nextQueue
            if (this.nextQueue.find(m => m.author === author)) {
                return true;
            }
        }
        return false;
    }

    GetNextQueueCommand(user) {
        return this.nextQueue.find(m => m.author === user).command;
    }

    RemoveFromNextQueue(author) {
        this.nextQueue = this.nextQueue.filter(m => m.author !== author);
    }

    async SendSticker(message, client) {
        if (message.hasMedia) {
            message.reply("خلني اشوف...")
            message.downloadMedia().then(media => {

                if (media) {

                    const mediaPath = './downloaded-media/';

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

                        })
                        fs.unlinkSync(fullFilename)
                    } catch (err) {
                        message.reply("احم مدري وش صار بس ما قدرت اسويه...")
                    }
                }
            });
            /*const media = await message.downloadMedia();
            message.reply("خلني أشوف...")
            try {
                await client.sendMessage(message.from, media, {
                    sendMediaAsSticker: true,
                    stickerAuthor: "Aires",
                    stickerName: "Jarvis"
                })
            }catch (e){
                message.reply("ما ينفع غير صورة يا حلو")
            }*/
        }else{
            message.reply("حط صورة/فيديو مع الرسالة يا غبي")
        }
    }

    async Kick(message, client = null){
        await message.getChat().then(async chat => {
            if (chat.id._serialized === this.workChannelID) {
                await message.getContact().then(async contact => {
                    const authorId = message.author;
                    for (let participant of chat.participants) {
                        if (participant.id._serialized === authorId && !participant.isAdmin) {
                            // Here you know they are not an admin
                            message.reply(`The kick command can only be used by group admins.`);
                            break;
                        } else if (participant.id._serialized === authorId && participant.isAdmin) {
                            await message.getMentions().then(async contacts => {
                                if (contacts.length > 0) {
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
                        }
                    }
                })
            }
        });
    }
}