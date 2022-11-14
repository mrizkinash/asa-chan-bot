const { AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
    name: 'pause',
    description: 'Pauses current playing song',
    execute(message, args, client) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            message.channel.send('Get into the voice channel first');
            return;
        }

        if (args.length > 0) {
            message.channel.send(`Usage: \`\`\`${process.env.PREFIX}pause\`\`\``);
            return;
        }

        const musicQueue = client.musicQueue;
        const serverQueue = musicQueue.get(message.guildId);

        if (serverQueue) {

            if (serverQueue.player.state.status === AudioPlayerStatus.Paused) {
                message.channel.send(`Player is currently paused. To unpause, use: \`\`\`${process.env.PREFIX}unpause\`\`\``);
                return;
            }

            serverQueue.player.pause();
            message.channel.send('Music player paused');

        } else {
            message.channel.send('There is no music currently playing');
        }
    },
};