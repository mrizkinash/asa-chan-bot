const JishoAPI = require('unofficial-jisho-api');
const kanjiUtils = require('../utils/kanjiUtils.js');
// TODO: Add reaction to give examples of words starting, ending, or containing the kanji

module.exports = {
    name: 'kanji',
    description: 'Search for a kanji/phrase in Jisho',
    async execute(message, args, client) {
        if (args.length != 1 || Array.from(args[0]).some(char => !kanjiUtils.isJapanese(char))) {
            message.channel.send(`Usage: \`\`\`${process.env.PREFIX}kanji [kanji / japanese phrase]\`\`\``);
            return;
        }

        const jisho = new JishoAPI();

        if (args[0].length > 1) {
            const kanjis = Array.from(args[0]).filter(kanjiUtils.isKanji);
            const tasks =
                [jisho.searchForPhrase(args[0]), jisho.scrapeForPhrase(args[0])]
                    .concat(kanjis.map(kanji => jisho.searchForKanji(kanji)));

            const [phraseResult, phraseURI, ...kanjisResult] =
                await Promise.allSettled(tasks);

            if (phraseResult.value?.meta.status == 200) {
                phraseResult.value.data[0].uri = phraseURI.value?.uri;
                const phraseEmbed = kanjiUtils.createPhraseEmbed(phraseResult.value.data[0]);

                let i = 0;
                const kanjisEmbed = [];
                while (i < kanjis.length) {
                    if (kanjisResult[i].value?.found) {
                        kanjisResult[i].value.query = kanjis[i];
                        kanjisEmbed.push(kanjiUtils.createKanjiEmbed(kanjisResult[i].value));
                    }
                    i++;
                }

                const finalEmbeds = kanjiUtils.getPaginatedEmbed([phraseEmbed, ...kanjisEmbed]);

                message.channel.send({ embeds: [finalEmbeds[0]] }).then(msg => {
                    const prev = '◀️';
                    const next = '▶️';
                    const reactions = [prev, next];

                    for (const reaction of reactions) {
                        msg.react(reaction);
                    }

                    const filter = (reaction, user) => {
                        return user.id === message.author.id
                            && reactions.includes(reaction.emoji.name);
                    };

                    const switchPage = (reaction) => {
                        if (reaction.emoji.name === prev) {
                            i--;
                            if (i < 0) i = finalEmbeds.length - 1;
                            msg.edit({ embeds: [finalEmbeds[i]] });
                        } else if (reaction.emoji.name === next) {
                            i++;
                            if (i >= finalEmbeds.length) i = 0;
                            msg.edit({ embeds: [finalEmbeds[i]] });
                        }
                    };

                    const collector = msg.createReactionCollector({ filter, dispose: true });

                    i = 0;
                    collector.on('collect', switchPage);
                    collector.on('remove', switchPage);
                });
            } else {
                message.channel.send('Phrase not found');
            }

        } else {
            const result = await jisho.searchForKanji(args[0]);

            if (result?.found) {
                result.query = args[0];
                const embed = kanjiUtils.createKanjiEmbed(result);

                message.channel.send({ embeds: [embed] });
            } else {
                message.channel.send('Kanji not found');
            }
        }
    },
};