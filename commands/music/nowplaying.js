const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'nowplaying',
    description: 'Pauses current playing song',
    aliases: ['np'],
    execute(message, args, client) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            message.channel.send('Get into the voice channel first');
            return;
        }

        if (args.length > 0) {
            message.channel.send(`Usage: \`\`\`${process.env.PREFIX}nowplaying / ${process.env.PREFIX}np\`\`\``);
            return;
        }

        const musicQueue = client.musicQueue;
        const serverQueue = musicQueue.get(message.guildId);

        if (serverQueue) {

            const embed = new EmbedBuilder()
                .setTitle('Currently playing')
                .addFields(
                    { name: 'Title', value: `**${serverQueue.songs[serverQueue.currPos].title}**` },
                    { name: 'Duration', value: serverQueue.songs[serverQueue.currPos].durationRaw },
                );

            message.channel.send({ embeds: [embed] });
        } else {
            message.channel.send('There is no music currently playing');
        }
    },
};