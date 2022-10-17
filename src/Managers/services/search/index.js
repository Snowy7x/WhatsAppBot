const BaseSearch = require('./base');
const YTSearch = require('./YTSearch');

module.exports =  class Searcher extends BaseSearch {
  constructor() {
    super();
    this.ytSearch = new YTSearch();
  }

   async handle(keyword) {
    return this.ytSearch.find(keyword);
  }
}
