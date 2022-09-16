// @ts-ignore
const fs = require("fs");
const BaseDownload = require("./base")
const YTDownload = require("./YTDownload")

module.exports = class Downloader extends BaseDownload {

  constructor() {
    super();
    this.ytDownload = new YTDownload();
    this.musics = this.getCachedMusics();
    console.log(this.musics);
  }

  async handle(videoId) {
    if (this.isMusicDownloaded(videoId)) {
      return `downloads/${videoId}.mp3`;
    }

    const result = await this.ytDownload.download(videoId);
    if (result == null) console.log("something went wrong 1")
    this.musics = [...this.musics, `${videoId}.mp3`];
    console.log("Downloaded")
    return result;
  }

  isMusicDownloaded(videoId) {
    return this.musics.includes(`${videoId}.mp3`);
  }

  getCachedMusics() {
    return fs.readdirSync(`downloads`);
  }
}
