const { AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
    name: 'skip',
    description: 'Skips currently playing audio / Set a track in the queue to be skipped next time it comes up',
    details: 'You can either run this command without any arguments, or with the track no. in the queue you want to skip. \n' +
        'When you run it without any arguments / with the track no. of the current playing audio, Asa-chan will skip the currently playing audio. \n' +
        'If you put the track no. you want to skip, the next time that track comes up Asa-chan will skip it. ' +
        'Asa-chan will only skip the track once so if you jumped around the queue after the track is skipped once it will play normally the next time it comes up. \n' +
        'This command is also used to stop audios on loop.',
    execute(message, args, client) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            message.channel.send('Get into the voice channel first');
            return;
        }

        if (args.length > 1) {
            message.channel.send(`Usage: \`\`\`${process.env.PREFIX}skip / ${process.env.PREFIX}skip [Track number]\`\`\``);
            return;
        }

        const musicQueue = client.musicQueue;
        const serverQueue = musicQueue.get(message.guildId);

        if (serverQueue?.player.state.status === AudioPlayerStatus.Playing) {
            if (args.length === 0) {
                serverQueue.songs[serverQueue.currPos].loop = false;
                serverQueue.player.stop();
            } else {

                const trackNo = parseInt(args[0]);

                if (isNaN(trackNo)) return message.channel.send(`Usage: \`\`\`${process.env.PREFIX}skip / ${process.env.PREFIX}skip [Track number]\`\`\``);
                if (trackNo < 1 || trackNo > serverQueue.songs.length) return message.channel.send('Can\'t skip inexistent track');

                if ((trackNo - 1) === serverQueue.currPos) {
                    serverQueue.songs[serverQueue.currPos].loop = false;
                    serverQueue.player.stop();
                    return;
                }
                serverQueue.songs[trackNo - 1].skip = true;
                message.channel.send(`Track no. ${trackNo} will be skipped`);
            }
        } else {
            message.channel.send('There is no music currently playing');
        }
    },
};