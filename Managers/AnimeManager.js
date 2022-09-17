const translate = require('translate-google')
const malScraper = require('mal-scraper')
const axios = require("axios")

const get = async (url) => {
    return await (axios.get(url).then(data => {
        return data.data;
    }).catch(() => {
        console.log("Something went wrong")
        return null;
    }))
}

const getLatestAnime = async () => {
    return await get("http://www.snowyanime.com/api/latest?page=1");
}

const getAnimeDetails = async (animeName) => {
    return await get("http://www.snowyanime.com/api/anime/" + animeName);
}

const getEpisodeDetails = async (animeName, episode) => {
    return await getAnimeDetails(animeName).then(async details => {
        if (details === null) return null;
        if (details.episodes.length >= episode){
            const data = await get("http://www.snowyanime.com/api/episode/" + details.episodes[episode-1].episodeUrl);
            data.img = details.img;
            return data;
        }
    })
}

module.exports = {getLatestAnime, getAnimeDetails, getEpisodeDetails}