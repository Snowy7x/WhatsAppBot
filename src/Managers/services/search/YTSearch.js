const { Options, search, VideoSearchResult } = require('yt-search');
const { MAX_DURATION } = require('../../config');

module.exports = class YTSearch {

  constructor() {
    this.pageStart = 1;
    this.pageEnd = 1;
  }

  async find(keyword){
    const options = this.generateOptions(keyword);

    const { videos } = await search(options);

    const { seconds, title, videoId, url } = await this.getFirstValid(videos);
    return {
      seconds,
      title,
      videoId,
      url,
    };
  }

  generateOptions(query) {
    return {
      query,
      pageStart: this.pageStart,
      pageEnd: this.pageEnd,
    };
  }

  getFirstValid(videos) {
    return videos[0].seconds <= MAX_DURATION
      ? videos[0]
      : this.getFirstValid(videos.slice(1));
  }
}
