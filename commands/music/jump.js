const musicUtils = require('../../utils/musicUtils');
const { AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
    name: 'jump',
    description: 'Jumps to the designated track number',
    details: 'This command accepts the track no. you want to jump to as an argument. ' +
        'Note that if you jump to a track set to be skipped, Asa-chan will skip it ' +
        '(e.g With 4545 songs in queue, Jun uses ``skip 1919``. ' +
        'If Jun enters ``jump 1919`` Asa-chan will skip track 1919 if it haven\'t been skipped before).\n' +
        'Jumping to another track while looping an audio will cause the loop to be turned off.',
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

            if (serverQueue.player.state.status === AudioPlayerStatus.Playing) {

                if (serverQueue.songs[serverQueue.currPos].loop && serverQueue.currPos !== trackNo - 1) {
                    serverQueue.songs[serverQueue.currPos].loop = false;
                    message.channel.send(`Track no. ${serverQueue.currPos + 1}'s loop set to off`);
                }
                serverQueue.currPos = trackNo - 2;
                serverQueue.player.stop();
            } else if (serverQueue.player.state.status === AudioPlayerStatus.Idle) {
                serverQueue.currPos = trackNo - 1;
                musicUtils.playMusic(serverQueue);
            }

        } else {
            message.channel.send('There is no music currently playing');
        }
    },
};