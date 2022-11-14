const musicUtils = require('../../utils/musicUtils');
const { AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
    name: 'jump',
    description: 'Jumps to the designated track number',
    execute(message, args, client) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            message.channel.send('Get into the voice channel first');
            return;
        }

        const trackNo = parseInt(args[0]);

        if (args.length !== 1 || isNaN(trackNo)) {
            message.channel.send(`Usage: \`\`\`${process.env.PREFIX}jump [Track number]\`\`\``);
            return;
        }

        const musicQueue = client.musicQueue;
        const serverQueue = musicQueue.get(message.guildId);

        if (serverQueue) {

            if (trackNo > serverQueue.songs.length || trackNo < 1) {
                message.channel.send('Can\'t jump to inexistent track');
                return;
            }

            serverQueue.currPos = trackNo - 2;
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