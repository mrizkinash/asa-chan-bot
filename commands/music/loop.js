const musicUtils = require('../../utils/musicUtils');

module.exports = {
    name: 'loop',
    description: 'Loops currently playing song',
    execute(message, args, client) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            message.channel.send('Get into the voice channel first');
            return;
        }

        if (args.length > 0) {
            message.channel.send(`Usage: \`\`\`${process.env.PREFIX}loop\`\`\``);
            return;
        }

        const musicQueue = client.musicQueue;
        const serverQueue = musicQueue.get(message.guildId);

        if (serverQueue) {

            if (serverQueue.currPos === serverQueue.songs.length) {
                serverQueue.songs[--(serverQueue.currPos)].loop = true;
                message.channel.send(`Looping track no. ${serverQueue.currPos + 1}...`);
                musicUtils.playMusic(serverQueue);
                return;
            }

            serverQueue.songs[serverQueue.currPos].loop = true;
            message.channel.send(`Track no. ${serverQueue.currPos + 1} set to loop.`);
        } else {
            message.channel.send('There is no music currently playing');
        }
    },
};