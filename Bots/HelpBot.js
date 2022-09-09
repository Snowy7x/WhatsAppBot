//import Bot from "./Bot.js";
const Bot = require("./Bot.js");
//import * as fs from "fs";
const fs = require("fs");
const {MessageMedia} = require("whatsapp-web.js");

const kickCmds = ["#kick", "#ban", "#طرد", "#كيك"]

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

    }

    OnQr(qr) {

    }

    OnReady() {
        console.log(`${this.name} bot is Ready!`);
    }

    async OnMessage(message, client = null) {
        const parts = message.body.split(" ");
        console.log(parts)
        if (kickCmds.includes(parts[0])){
            await this.Kick(message, client);
            return;
        }
        if (message.body.startsWith(this.prefix) || this.IsInNextQueue(message.author)) {
            message.getChat().then(async chat => {
                console.log(chat.id._serialized + " === " + this.workChannelID)
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

                    let commandName = message.body.replace(this.prefix + " ", "");
                    console.log(`${commandName} command is executing!`);

                    let command = this.GetCommand(commandName);

                    if (command) {
                        if (command.isSticker) {
                            console.log("ggg a not a command")
                            await this.SendSticker(message, client)
                        }else {
                            console.log("ggg a command")
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
                    }
                }
            })
        }else{
            console.log(message.body);
        }
    }

    AddCommand(command, message, hasSub = false, hasNext = false, sub = [], next = [], list = "", isSticker = false) {
        // Check if command already exists
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
            const media = await message.downloadMedia();
            message.reply("خلني أشوف...")
            try {
                await client.sendMessage(message.from, media, {
                    sendMediaAsSticker: true,
                    stickerAuthor: "Aires",
                    stickerName: "Jarvis"
                })
            }catch (e){
                message.reply("ما ينفع غير صورة يا حلو")
            }
        }else{
            message.reply("حط صورة مع الرسالة يا غبي")
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
                                        console.log("81: ", err)
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