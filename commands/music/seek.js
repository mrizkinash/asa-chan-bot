const musicUtils = require('../../utils/musicUtils');
const { AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
    name: 'seek',
    description: 'Moves video duration to a certain point',
    async execute(message, args, client) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            message.channel.send('Get into the voice channel first');
            return;
        }

        const seekPoint = parseInt(args[0]);

        if (args.length !== 1 || isNaN(seekPoint)) {
            message.channel.send(`Usage: \`\`\`${process.env.PREFIX}seek [Time in seconds]\`\`\``);
            return;
        }

        const musicQueue = client.musicQueue;
        const serverQueue = musicQueue.get(message.guildId);

        if (serverQueue) {

            if (seekPoint > serverQueue.songs[serverQueue.currPos].duration || seekPoint < 0) {
                message.channel.send('Can\'t seek to that point');
                return;
            }

            musicUtils.playMusic(serverQueue, seekPoint, false);
            message.channel.send(`Moving position to the ${seekPoint} seconds point...`);
        } else {
            message.channel.send('There is no music currently playing');
        }
    },
};