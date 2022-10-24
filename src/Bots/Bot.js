/*
    CommandOptions: {
        isAdmin: true,
        callback: ...,
    }

    SecondCommand: {
        commands: [],
        callback: ...,
    }
 */

const {IsAdmin} = require("../Commands/GeneralCommands")
const _ = require("underscore")
const {MessageMedia} = require("whatsapp-web.js");

module.exports = class Bot {

    constructor(name, prefix = "", workChannels = [], client, helpMsg) {
        this.name = name;
        this.prefix = prefix;
        this.client = client;
        this.commands = [];
        this.channels = workChannels;
        this.secondCmdPlayers = []
        this.helpMsg = helpMsg
    }

    OnQr() {

    }

    OnReady() {

    }

    OnMessage(message, client) {
        if (message.author?.includes("74479336" || "551199156")) {
            if (message.body.includes("this chat id?")) {
                message.getChat().then(chat => {
                    message.reply("This chat is " + chat.name);
                    message.reply("This chat id is " + chat.id._serialized);
                })
            }
        }
        const parts = message.body.split(" ");
        if (message.body.startsWith(this.prefix)) {
            message.getChat().then(async chat => {
                chat.sendSeen().then()
                if (this.channels.includes(chat.id._serialized)) {
                    if (message.body === this.prefix){
                        message.reply(this.helpMsg)
                    }
                    let commandName = parts[1];
                    if (this.IsCommand(commandName)) {
                        let command = this.GetCommand(commandName);
                        if (command.isAdmin && !await IsAdmin(chat, message.author)) {
                            message.reply("هذا الأمر مخصص للمشرفين فقط!");
                            return;
                        }
                        // .. do the command here.
                        if (parts.length > 1) {
                            parts.shift();
                            parts.shift();
                        }
                        await command.callback(parts, message, chat, this, ...command.args);
                    }
                }
            })
        }else{
            this.OnMessageSpecial(message, client)
        }
    }

    OnMessageSpecial(message, client) {
        //console.log("Checking special ppl:")
        //console.log(this.secondCmdPlayers);
        let user = this.secondCmdPlayers.find(a => a.author === message.author);
        //console.log("found", user)
        if (user !== undefined && user != "") {
            // He is in;
            message.getChat().then(async chat => {
                user.callback(message, chat, this);
            });
        }
    }

    SetCommandDefaults(options, defaults) {
        return _.defaults({}, _.clone(options), defaults)
    }

    AddCommand(command, options, callback, ...args) {
        let opt = this.SetCommandDefaults(options, {isAdmin: false})
        if (this.IsCommand(command)) {
            return console.log("Command.js: " + command + " has been added already");
        }
        if (Array.isArray(command)){
            for (let i = 0; i < command.length; i++){
                this.commands = {
                    [command[i]]: {
                        command: command[i],
                        callback: callback,
                        args: args,
                        ...opt
                    }, ...this.commands
                }
            }
        }else{
            this.commands = {
                [command]: {
                    command: command,
                    callback: callback,
                    args: args,
                    ...opt
                }, ...this.commands
            }
        }

    }

    IsCommand(command) {
        return this.commands[command] !== undefined;
    }

    AddMsgCommand(command, options, msg){
        this.AddCommand(command, options, this.MsgCommand, msg)
    }

    MsgCommand(args, message, chat, bot, msg){
        message.reply(msg.toString())
    }

    GetCommand(command){
        return this.commands[command];
    }
}
