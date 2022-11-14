const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'queue',
    description: 'Shows the current music queue',
    execute(message, args, client) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            message.channel.send('I don\'t wanna move from here~. If you wanna see the queue get into the voice channel~~');
            return;
        }

        const musicQueue = client.musicQueue;
        const serverQueue = musicQueue.get(message.guildId);

        if (serverQueue) {
            const embed = new EmbedBuilder();

            let count = 0;
            const text = [];
            for (const song of serverQueue.songs) {
                if (count === serverQueue.currPos) {
                    text.push(`***${++count}. ${song.title} | ${song.durationRaw}***`);
                } else {
                    text.push(`${++count}. ${song.title} | ${song.durationRaw}`);
                }
            }

            embed.addFields({
                name: 'Current Music Queue',
                value: text.join('\n'),
            });

            message.channel.send({ embeds: [embed] });
        } else {
            message.channel.send('No song is currently playing');
        }
    },
};