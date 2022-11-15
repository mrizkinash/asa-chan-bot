const { AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
    name: 'unpause',
    description: 'Unpauses the player and resumes last played audio',
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

            if (serverQueue.player.state.status !== AudioPlayerStatus.Paused) {
                message.channel.send(`Player currently not paused. To pause, use: \`\`\`${process.env.PREFIX}pause\`\`\``);
                return;
            }

            serverQueue.player.unpause();
            message.channel.send('Resuming playback...');

        } else {
            message.channel.send('There is no music currently playing');
        }
    },
};