const playdl = require('play-dl');
const musicUtils = require('../utils/musicUtils');
const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
    name: 'play',
    description: 'Joins into a voice chat and plays youtube vids',
    async execute(message, args, client) {
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

        if (ytVal === 'playlist') {
            message.channel.send('Current version doesn\'t support playlists yet');
            return;
        }

        if (ytVal && args[0].startsWith('https')) {
            url = args[0];
        } else {
            const videoResult = await playdl.search(args.join(' '), {
                source: { youtube: 'video' },
                limit: 1,
            });
            const video = (videoResult.length >= 1) ? videoResult[0] : null;
            if (video) url = video.url;
        }

        if (url) {

            const musicQueue = client.musicQueue;
            let serverQueue = musicQueue.get(message.guildId);

            const vidInfo = await playdl.video_info(url);
            const song = {
                url: url,
                title: vidInfo.video_details.title,
                duration: vidInfo.video_details.durationInSec,
                durationRaw: vidInfo.video_details.durationRaw,
            };

            if (!serverQueue) {

                const queueConstruct = {
                    textChannel: message.channel,
                    connection: null,
                    player: null,
                    songs: [],
                    currPos: 0,
                };
                queueConstruct.songs.push(song);

                const connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: voiceChannel.guildId,
                    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
                });

                const player = createAudioPlayer({
                    behaviors: {
                        noSubscriber: NoSubscriberBehavior.Play,
                    },
                });

                connection.subscribe(player);
                queueConstruct.connection = connection;
                queueConstruct.player = player;
                serverQueue = queueConstruct;
                musicQueue.set(message.guildId, serverQueue);

                player.on('stateChange', async (oldState, newState) => {
                    if ((oldState.status === AudioPlayerStatus.Playing) && (newState.status === AudioPlayerStatus.Idle)) {

                        if (++(serverQueue.currPos) < serverQueue.songs.length) {
                            musicUtils.playMusic(serverQueue);
                        } else {
                            message.channel.send('Reached the end of playlist');
                        }
                    }
                });

                player.on('error', error => {
                    message.channel.send('Error occured during playback. Aborting...');
                    musicUtils.destroyConnection(musicQueue, serverQueue, message.guildId);
                    console.error(error);
                });

            } else {
                serverQueue.songs.push(song);
            }
            message.channel.send(`***${song.title}*** added to queue | ${song.durationRaw} | Track no. ${serverQueue.songs.length}`);

            if (serverQueue.player.state.status === AudioPlayerStatus.Idle) {
                musicUtils.playMusic(serverQueue);
            }
        } else {
            message.channel.send('Couldn\'t find video');
        }
    },
};