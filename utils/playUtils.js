const ytSearch = require('yt-search');

async function videoFinder(query) {
    const videoResult = await ytSearch(query);

    return (videoResult.videos.length) >= 1 ? videoResult[0] : null;
}

module.exports = {
    videoFinder,
};