const musicUtils = require('../../utils/musicUtils');

module.exports = {
    name: 'queue',
    description: 'Shows the current audio queue',
    details: 'This command shows you the current audio queue. ' +
        'If there are more than 10 audios, Asa-chan will divide the queue into pages. ' +
        'You can switch pages by pressing the reaction buttons under the queue. ' +
        'Do note that only the user who used the ``queue`` command can switch the pages.',
    execute(message, args, client) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            message.channel.send('I don\'t wanna move from here~. If you wanna see the queue get into the voice channel~~');
            return;
        }

        const musicQueue = client.musicQueue;
        const serverQueue = musicQueue.get(message.guildId);

        if (serverQueue) {

            const maxQueue = 10;
            let i = Math.floor(serverQueue.currPos / maxQueue);
            let count = 0;
            const text = [];
            for (const song of serverQueue.songs) {
                if (count === serverQueue.currPos) {
                    text.push(`***${++count}. ${song.title} | ${song.durationRaw}***`);
                } else {
                    text.push(`${++count}. ${song.title} | ${song.durationRaw}`);
                }
            }

            const finalEmbeds = musicUtils.createPaginatedQueue(text, maxQueue);

            message.channel.send({ embeds: [finalEmbeds[i]] }).then((msg) => {
                if (serverQueue.songs.length <= maxQueue) return;
                const prev = '◀️';
                const next = '▶️';
                const reactions = [prev, next];

                for (const reaction of reactions) {
                    msg.react(reaction);
                }

                const filter = (reaction, user) => {
                    return user.id === message.author.id
                        && reactions.includes(reaction.emoji.name);
                };

                const switchPage = (reaction) => {
                    if (reaction.emoji.name === prev) {
                        i--;
                        if (i < 0) i = finalEmbeds.length - 1;
                        msg.edit({ embeds: [finalEmbeds[i]] });
                    } else if (reaction.emoji.name === next) {
                        i++;
                        if (i >= finalEmbeds.length) i = 0;
                        msg.edit({ embeds: [finalEmbeds[i]] });
                    }
                };

                const collector = msg.createReactionCollector({ filter, dispose: true });
                collector.on('collect', switchPage);
                collector.on('remove', switchPage);
            });
        } else {
            message.channel.send('No song is currently playing');
        }
    },
};