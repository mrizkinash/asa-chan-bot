const playdl = require('play-dl');
const musicUtils = require('../../utils/musicUtils');
const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
    name: 'play',
    description: 'Joins into a voice chat and plays youtube vids\'s audio',
    details: 'This command accepts either keyword(s) or youtube url. \n' +
        'If you enter keyword(s) as arguments Asa-chan will play the first thing she finds with that keyword. \n' +
        'If you enter a video url Asa-chan will play that video\'s audio. \n' +
        'If you enter a playlist url Asa-chan will load all the videos in that playlist into the queue.',
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

            const songs = [];
            const musicQueue = client.musicQueue;
            let serverQueue = musicQueue.get(message.guildId);

            if (ytVal === 'video' || ytVal === 'search') {
                try {
                    const vidInfo = await playdl.video_info(url);
                    const song = new musicUtils.Song(
                        url,
                        vidInfo.video_details.title,
                        vidInfo.video_details.durationInSec,
                        vidInfo.video_details.durationRaw,
                    );
                    songs.push(song);
                } catch (error) {
                    message.channel.send('Error loading audio');
                    console.error(error);
                    return;
                }
            } else if (ytVal === 'playlist') {

                try {
                    const playlist = await playdl.playlist_info(url);
                    const playlistItems = await playlist.all_videos();

                    for (const item of playlistItems) {
                        const song = new musicUtils.Song(
                            item.url,
                            item.title,
                            item.durationInSec,
                            item.durationRaw,
                        );
                        songs.push(song);
                    }
                } catch (error) {
                    message.channel.send('Error loading playlist');
                    console.error(error);
                    return;
                }
            }

            if (!serverQueue) {

                const queueConstruct = {
                    textChannel: message.channel,
                    connection: null,
                    player: null,
                    songs: songs,
                    currPos: 0,
                    loopMode: false,
                };

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

                        if (serverQueue.songs[serverQueue.currPos]?.loop) {
                            serverQueue.songs[serverQueue.currPos].skip = false;
                            if (!(serverQueue.loopMode)) {
                                message.channel.send(`Looping track no. ${serverQueue.currPos + 1}. Use the \`\`skip\`\` command to stop the loop`);
                            }
                            serverQueue.loopMode = true;
                            --(serverQueue.currPos);
                        }

                        if (serverQueue.songs[serverQueue.currPos + 1]?.skip) {
                            message.channel.send(`Skipping track no. ${++(serverQueue.currPos) + 1}...`);
                            serverQueue.songs[serverQueue.currPos].skip = false;
                        }

                        if (++(serverQueue.currPos) < serverQueue.songs.length) {
                            musicUtils.playMusic(serverQueue, 0, !serverQueue.loopMode);
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
                serverQueue.songs.push(...songs);
            }

            if (songs.length === 1) {
                message.channel.send(`***${songs[0].title}*** added to queue | ${songs[0].durationRaw} | Track no. ${serverQueue.songs.length}`);
            } else if (songs.length > 1) {
                message.channel.send(`***${songs.length}*** audios added to queue`);
            }

            if (serverQueue.player.state.status === AudioPlayerStatus.Idle) {
                musicUtils.playMusic(serverQueue);
            }
        } else {
            message.channel.send('Couldn\'t find video');
        }
    },
};