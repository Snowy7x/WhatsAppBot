const ytdl = require('ytdl-core');
const fs = require('fs');
const FFMPEG = require('ffmpeg');
const { DOWNLOAD_PATH } = require('../../config');

module.exports =  class YTDownload {
  async download(videoId) {

    const videoPath = `${DOWNLOAD_PATH}/${videoId}.mp4`;
    try {
      const audio = ytdl(`https://www.youtube.com/watch?v=${videoId}`, {
        quality: 'lowestaudio',
      })
          // FFF: Feature For Future
          // .on('progress', (_, downloaded, total) => {
          //   console.log(downloaded, total);
          // })
          .pipe(fs.createWriteStream(videoPath));
      console.log("Doing it")
      const downloadEnd = await new Promise(resolve => {
        audio.on('finish', () => resolve(true));
        audio.on('error', () => resolve(false));
      });

      if (!downloadEnd) {
        // oh no i can't download this shit 😵️
        console.log("gg")
      }

      return this.extractMp3FromMp4(videoPath);
    }catch (e) {
      console.log(e.message);
      return null;
    }
  }

  async extractMp3FromMp4(videoPath) {
    const audioPath = videoPath.split('.')[0];
    const video = await new FFMPEG(videoPath);
    const result = await video.fnExtractSoundToMP3(`${audioPath}.mp3`);

    fs.unlinkSync(`${audioPath}.mp4`);

    return result;
  }
}
