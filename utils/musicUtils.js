const playdl = require('play-dl');
const { createAudioResource } = require('@discordjs/voice');

async function playMusic(serverQueue, seek = 0, toggleMessage = true) {
    const stream = await playdl.stream(serverQueue.songs[serverQueue.currPos].url, { seek: seek, quality: 1 });
    const resource = createAudioResource(stream.stream, {
        inputType: stream.type,
    });
    serverQueue.player.play(resource);

    if (toggleMessage) serverQueue.textChannel.send(`Now playing ***${serverQueue.songs[serverQueue.currPos].title}*** | ${serverQueue.songs[serverQueue.currPos].durationRaw} | Track no. ${serverQueue.currPos + 1}`);
}

function destroyConnection(musicQueue, serverQueue, guildId) {
    musicQueue.delete(guildId);
    serverQueue.player.removeAllListeners('stateChange');
    serverQueue.player.stop();
    serverQueue.player = null;
    serverQueue.connection.destroy();
}

module.exports = {
    playMusic,
    destroyConnection,
};