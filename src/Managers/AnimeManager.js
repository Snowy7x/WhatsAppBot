const malScraper = require('mal-scraper')
const axios = require("axios")
const {Alphacoders} = require("awse");
const translate = require('translate-google')
const io = require("cheerio");
const files = require("fs")

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

const getLatestNews = async () => {
    console.log("Fetching news")
    let rawData = files.readFileSync("news.json")
    let oldData = JSON.parse(rawData);

    let newData = {};
    await axios("https://www.crunchyroll.com/ar/news").then(res => {
        console.log("Got the website")
        const $ = io.load(res.data)
        $(".news-item").each((index, item) => {
            newData[index] = {
                tile: $(item).find("h2").text().trim(),
                description: $(item).find(".body .short p").text().trim(),
                image: $(item).find(".body img").attr("src"),
                link: "https://www.crunchyroll.com/" + $(item).find(".below-body .read-more a:nth-child(2)").attr("href")
            }
        })
    }).catch(err => {
        console.log("Error: " + err)
    })

    let newNews = {}

    if (oldData[0].link !== newData[0].link) {
        console.log("there is different: " + Object.keys(newData).length)
        newNews[0] = newData[0]
        let i = 1;
        while (newData[i].link !== oldData[0].link) {
            newNews[i] = newData[i];
            i++
            if (i >= Object.keys(newData).length) {
                break
            }
        }

        newData = JSON.stringify(newData)
        files.writeFile("news.json", newData, 'utf8', function (err) {
            if (err) {
                console.log("An error occurred while writing JSON Object to File.");
                return console.log(err);
            }

            console.log("JSON file has been saved.");
        });
    } else {
        console.log("no difference")
    }

    return newNews


}

module.exports = {getLatestAnime, getAnimeDetails, getEpisodeDetails, getSongs, getWallpapers, getLatestNews}