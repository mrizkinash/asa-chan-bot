const musicUtils = require('../../utils/musicUtils');

module.exports = {
    name: 'stop',
    description: 'Stops playing audio and leave the voice channel',
    execute(message, args, client) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            message.channel.send('Get inside and carry me out, Ani~~');
            return;
        }

        const musicQueue = client.musicQueue;
        const serverQueue = musicQueue.get(message.guildId);

        if (serverQueue) {
            musicUtils.destroyConnection(musicQueue, serverQueue, message.guildId);
            message.channel.send('Bye');
        } else {
            message.channel.send('There is no music currently playing');
        }
    },
};