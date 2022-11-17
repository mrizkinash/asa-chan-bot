module.exports = {
    name: 'remove',
    description: 'Removes designated track number from the queue',
    execute(message, args, client) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            message.channel.send('Get into the voice channel first');
            return;
        }

        const trackNo = parseInt(args[0]);
        if (args.length !== 1 || isNaN(trackNo)) {
            message.channel.send(`Usage: \`\`\`${process.env.PREFIX}remove [Track number]\`\`\``);
            return;
        }

        const musicQueue = client.musicQueue;
        const serverQueue = musicQueue.get(message.guildId);

        if (serverQueue) {

            if (trackNo > serverQueue.songs.length || trackNo < 1) {
                message.channel.send('Can\'t remove inexistent track');
                return;
            }
            if (trackNo == serverQueue.currPos + 1) {
                message.channel.send('You can\'t remove currently playing track');
                return;
            }

            if (trackNo < serverQueue.currPos + 1) serverQueue.currPos -= 1;
            serverQueue.songs.splice(trackNo - 1, 1);

            message.channel.send(`Removed track no. ${trackNo} from the queue`);
        } else {
            message.channel.send('There is no music currently playing');
        }
    },
};