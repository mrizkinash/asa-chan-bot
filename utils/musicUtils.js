const playdl = require('play-dl');
const { createAudioResource } = require('@discordjs/voice');
const { EmbedBuilder } = require('discord.js');

class Song {
    constructor(url, title, duration, durationRaw) {
        this.url = url;
        this.title = title;
        this.duration = duration;
        this.durationRaw = durationRaw;
        this.skip = false;
        this.loop = false;
    }
}

async function playMusic(serverQueue, seek = 0, toggleMessage = true) {
    const stream = await playdl.stream(serverQueue.songs[serverQueue.currPos].url, { seek: seek });
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

function createPaginatedQueue(queueTextArr, maxQueue) {

    const embeds = [];
    const pageCount = Math.ceil(queueTextArr.length / maxQueue);

    if (pageCount === 1) {
        const embed = new EmbedBuilder()
            .addFields({
                name: 'Current Music Queue',
                value: queueTextArr.join('\n'),
            });

        embeds.push(embed);
    } else {
        let i = 0;

        while (i < pageCount) {
            const embed = new EmbedBuilder()
                .addFields({
                    name: 'Current Music Queue',
                    value: queueTextArr.slice(i * maxQueue, (i + 1) * maxQueue).join('\n'),
                })
                .setFooter({ text: `Page ${++i} of ${pageCount}` });

            embeds.push(embed);
        }
    }

    return embeds;
}

module.exports = {
    Song,
    playMusic,
    destroyConnection,
    createPaginatedQueue,
};