const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    name: 'stop',
    description: 'Stops playing yt vid and leave the voice channel',
    async execute(message, args) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            message.channel.send('Get inside and carry me out, Ani~~');
            return;
        }

        const connection = getVoiceConnection(voiceChannel.guildId);
        connection.destroy();
        message.channel.send('Later');
    },
};