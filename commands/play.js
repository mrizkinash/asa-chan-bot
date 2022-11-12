const playdl = require('play-dl');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior, AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
    name: 'play',
    description: 'Joins into a voice chat and plays youtube vids',
    async execute(message, args) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            message.channel.send('Did you really think your cute little sister can enter a voice channel all by herself?');
            return;
        }

        if (!args.length) {
            message.channel.send('I can\'t play music out of nowhere');
            return;
        }

        message.channel.send('Roger! Working on it...');
        let url = null;
        const ytVal = playdl.yt_validate(args[0]);

        if (ytVal && args[0].startsWith('https')) {
            url = args[0];
        } else {
            const videoResult = await playdl.search(args.join(' '), {
                source: { youtube: 'video' },
                limit: 1,
            });
            const video = (videoResult.length) >= 1 ? videoResult[0] : null;
            if (video) url = video.url;
        }

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guildId,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });

        if (url) {

            const [vidInfo, stream] = await Promise.allSettled([
                await playdl.video_info(url),
                await playdl.stream(url),
            ]);
            const player = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Play,
                },
            });
            const resource = createAudioResource(stream.value.stream, {
                inputType: stream.value.type,
            });

            player.play(resource);
            connection.subscribe(player);
            message.channel.send(`Now Playing ***${vidInfo.value.video_details.title}***`);

            player.on('error', error => {
                message.channel.send('Error occured during playback. Aborting...');
                console.error(error);
            });

            player.on(AudioPlayerStatus.Idle, (oldState, newState) => {
                if (oldState.status === AudioPlayerStatus.Playing) {
                    message.channel.send('Reached end of playlist');
                }
            });
        } else {
            message.channel.send('Couldn\'t find video');
        }
    },
};