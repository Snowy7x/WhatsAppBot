const movieInfo = require('movie-info')
const {translate} = require("free-translate")

const getMoveDetails = async (movieName) => {
    let data;
    await movieInfo(movieName).then(da => {
        data = da;
    })
    return {
        name: data.title,
        desc:  await translate(data.overview, {from: "en", to: "ar"}),
        poster: data.imageBase + data.poster_path,
        release: data.release_date,
        vote: data.vote_average
    }
}

module.exports = {getMoveDetails}