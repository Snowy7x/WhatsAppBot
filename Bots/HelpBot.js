//import Bot from "./Bot.js";
const Bot = require("./Bot.js");
//import * as fs from "fs";
const fs = require("fs");

// Importing corn


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

    OnMessage(message) {
        if (message.body.startsWith(this.prefix) || this.IsInNextQueue(message.author)) {
            message.getChat().then(chat => {
                if (chat.id._serialized === this.workChannelID) {
                    if (message.body === this.name || message.body === this.prefix) {
                        console.log(`${message.body} command is executed!`);
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
            })
        }
    }

    AddCommand(command, message, hasSub = false, hasNext = false, sub = [], next = [], list = "") {
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
                list: list
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
}