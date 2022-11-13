const { AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
    name: 'skip',
    description: 'Skips currently playing yt vid',
    async execute(message, args, client) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            message.channel.send('Get into the voice channel first');
            return;
        }

        if (args.length === 1 && Number.isInteger(args[0])) {
            message.channel.send(`For skipping specific tracks, use: \`\`\`${process.env.PREFIX}remove [Track number]\`\`\``);
            return;
        }

        const musicQueue = client.musicQueue;
        const serverQueue = musicQueue.get(message.guildId);

        if (serverQueue && serverQueue?.player?.state?.status === AudioPlayerStatus.Playing) {
            serverQueue.player.stop();
        } else {
            message.channel.send('There is no music currently playing');
        }
    },
};