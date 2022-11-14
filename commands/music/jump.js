const musicUtils = require('../../utils/musicUtils');
const { AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
    name: 'jump',
    description: 'Jumps to the designated track number',
    async execute(message, args, client) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            message.channel.send('Get into the voice channel first');
            return;
        }

        if (args.length !== 1 || isNaN(parseInt(args[0]))) {
            message.channel.send(`Usage: \`\`\`${process.env.PREFIX}jump [Track number]\`\`\``);
            return;
        }

        const musicQueue = client.musicQueue;
        const serverQueue = musicQueue.get(message.guildId);

        if (serverQueue) {

            if (args[0] > serverQueue.songs.length || args[0] < 1) {
                message.channel.send('Can\'t jump to inexistent track');
                return;
            }

            serverQueue.currPos = args[0] - 2;
            if (serverQueue.player.state.status === AudioPlayerStatus.Playing) {
                serverQueue.player.stop();
            } else if (serverQueue.player.state.status === AudioPlayerStatus.Idle) {
                serverQueue.currPos += 1;
                musicUtils.playMusic(serverQueue);
            }

        } else {
            message.channel.send('There is no music currently playing');
        }
    },
};