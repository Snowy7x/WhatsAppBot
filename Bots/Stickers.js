const {Sticker, creatSticker, StickerTypes} = require("wa-sticker-formatter")

const getSticker = () => {
    var image = "https://i.pinimg.com/originals/02/eb/3a/02eb3aaaf2df1fbfd4c7b0ac4cb80214.jpg";
    return new Sticker(image, {
        pack: "Aires",
        author: "Snowy",
        quality: 50,
        background: "#ffffff"
    })
}

module.exports = {getSticker}
