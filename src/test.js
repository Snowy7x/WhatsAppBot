const io = require("cheerio")
const axios = require("axios")
files = require("fs")
const {getLatestNews} = require("./Managers/AnimeManager");
const cron2 = require("node-cron")


getLatestNews().then(data => console.log(data))

return;
// Getting anime character names:
const anilist = require('anilist-node');
const Anilist = new anilist();
const {Translate} = require("./Commands/GeneralCommands");
const fs = require("fs");
const cron = require("node-cron");
let id = Math.floor(Math.random() * 10000) + 1
console.log(id)
Anilist.people.character(id).then(async data => {
    let araName = await Translate(data.name.english, "ar")
    console.log(data.name.english)
    console.log(araName)
});