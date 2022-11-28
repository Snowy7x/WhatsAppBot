const malScraper = require('mal-scraper')
const axios = require("axios")
const {Alphacoders} = require("awse");
const translate = require('translate-google')

const isEnglish = str => {
    str = str.replaceAll(" ", "")
    const regex = /^[~`!@#$%^&*()_+=[\]\{}|;':",.\/<>?a-zA-Z0-9-]+$/;
    return regex.test(str)
};

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
    if (!isEnglish(animeName)) {
        await translate(animeName, {to: 'en'}).then((da) => {
            animeName = da
        }).catch((err) => {
            console.log("something wrong:", err)
            animeName = encodeURI(animeName)
        })
    }
    animeName = animeName.replaceAll(" ", "-")
    let details;
    await get("http://www.snowyanime.com/api/anime/" + animeName).then(res => {
        details = res
    }).catch(er => {
        console.log("Error fetching")
        console.log(er)
        details = null
    })
    return details;
}

const getEpisodeDetails = async (animeName, episode) => {
    if (!isEnglish(animeName)) {
        await translate(animeName, {to: 'en'}).then((da) => {
            animeName = da
        }).catch((err) => {
            console.log("something wrong:", err)
            animeName = encodeURI(animeName)
        })
    }
    animeName = animeName.replaceAll(" ", "-")
    return await getAnimeDetails(animeName).then(async details => {
        if (details === null) return null;
        if (details.episodes.length >= episode){
            const ep = details.episodes.find(x => x.episodeNumber === episode.toString())
            const data = await get("http://www.snowyanime.com/api/episode/" + ep.episodeUrl);
            data.img = details.img;
            return data;
        }
        return null;
    })
}

const getSongs = async (animeName) => {
    if (!isEnglish(animeName)) {
        await translate(animeName, {to: 'en'}).then((da) => {
            animeName = da
        }).catch((err) => {
            console.log("something wrong:", err)
            animeName = encodeURI(animeName)
        })
    }
    animeName = animeName.replaceAll(" ", "-")
    let data = await get(`https://api.animethemes.moe/search?page[limit]=4&fields[search]=anime,animethemes,artists,series,studios&q=${animeName}&include[anime]=animethemes.animethemeentries.videos,animethemes.animethemeentries.videos.audio,animethemes.song,images&fields[anime]=name&fields[animetheme]=type,slug&fields[animethemeentry]=spoiler,nsfw&fields[video]=tags,resolution,nc,subbed,lyrics,uncen,source,overlap&fields[image]=facet,link&fields[song]=title`);
    data = data.search.anime;
    let songs = {};
    data.map((details, index) => {
        let themes = [];
        details.animethemes.map((theme, index) => {
            let th = theme.animethemeentries[theme.animethemeentries.length-1];
            themes[theme.song.title] = {
                title: theme.song.title,
                type: theme.type,
                slug: theme.slug,
                link: th.videos[th.videos.length-1].audio.link
            }
        })
        songs[details.name] = {
            name: details.name,
            themes
        }
    })
    return songs
}

const getWallpapers = async (animeName) => {
    let search;
    await translate(animeName, {to: 'en'}).then((da) => {
        search = da
    }).catch((err) => {
        console.log("something wrong:", err)
        search = encodeURI(animeName)
    })
    let result = await Alphacoders.get({
        search: search,
        pages: 2,
        type: "Mobile"
    })
    result = result.randomRange(10)
    return result
}

module.exports = {getLatestAnime, getAnimeDetails, getEpisodeDetails, getSongs, getWallpapers}