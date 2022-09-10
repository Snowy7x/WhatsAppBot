const movieInfo = require('movie-info')
const {translate} = require("free-translate")

const getMoveDetails = async (movieName) => {
    let data;
    await movieInfo(movieName).then(da => {
        data = da;
        console.log("got the data")
    })
    let desc;
    await translate(data.overview, {from: "en", to: "ar"}).then((da) => {
        console.log("got the desc")
        desc = da
    }).catch((err) => {
        console.log("something wrong:", err)
        desc = data.overview
    })
    console.log("got the desc")
    return {
        name: data.title,
        desc:  desc,
        poster: data.imageBase + data.poster_path,
        release: data.release_date,
        vote: data.vote_average
    }
}

module.exports = {getMoveDetails}