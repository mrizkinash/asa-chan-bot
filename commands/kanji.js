const JishoAPI = require('unofficial-jisho-api');
const { EmbedBuilder } = require('discord.js');
// TODO: Add reaction to give examples of words starting, ending, or containing the kanji
// TO DO: Make individual kanji show up with reactions instead of showing all of them
function createKanjiEmbed(data) {
    const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle(data.query)
        .setURL(data.uri)
        .addFields(
            { name: 'JLPT Level', value: (data.jlptLevel || 'Unknown'), inline: true },
            { name: 'Stroke Count', value: String(data.strokeCount), inline: true },
            { name: 'Meaning', value: data.meaning },
            { name: 'Kunyomi', value: (data.kunyomi.join(', ') || '\u200b'), inline: true },
            { name: 'Onyomi', value: (data.onyomi.join(', ') || '\u200b'), inline: true },
            { name: '\u200b', value: '\u200b', inline: true },
            { name: 'Radical', value: data.radical.meaning.concat(' ', data.radical.symbol), inline: true },
            { name: 'Parts', value: data.parts.join(', '), inline: true },
            { name: '\u200b', value: '\u200b', inline: true },
        )
        .setImage(data.strokeOrderGifUri);

    return embed;
}

function createPhraseEmbed(data) {
    const reading = data.japanese
        .map(japanese => japanese.word.concat(` (${japanese.reading})`))
        .join(', ');

    let meaning = '';
    let i = 1;

    for (const item of data.senses) {
        if (meaning.length != 0) meaning = meaning + '\n';

        const defs = item.english_definitions.join(', ');
        meaning = meaning.concat(i.toString(), `. ${defs}`);
        i++;
    }

    const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle(data.slug)
        .setURL(data.uri)
        .addFields(
            { name: reading, value: meaning },
        );

    return embed;
}

function isKanji(char) {
    return (char >= '\u4e00' && char <= '\u9faf') || (char >= '\u3400' && char <= '\u4dbf');
}

module.exports = {
    name: 'kanji',
    description: 'Search for a kanji/phrase in Jisho',
    async execute(client, message, args) {
        if (args.length != 1) {
            message.channel.send('Usage: ```!kanji [kanji/japanese phrase]```');
            return;
        }

        const jisho = new JishoAPI();

        try {

            if (args[0].length > 1) {
                const kanjis = args[0].split('').filter(isKanji);
                const tasks =
                    [jisho.searchForPhrase(args[0]), jisho.scrapeForPhrase(args[0])]
                        .concat(kanjis.map(kanji => jisho.searchForKanji(kanji)));

                const [phraseResult, phraseURI, ...kanjisResult] =
                    await Promise.allSettled(tasks);

                if (phraseResult.value.meta.status == 200) {
                    phraseResult.value.data[0].uri = phraseURI?.value.uri;
                    const phraseEmbed = createPhraseEmbed(phraseResult.value.data[0]);

                    let i = 0;
                    const kanjisEmbed = [];
                    while (i < kanjis.length) {
                        if (kanjisResult[i].value.found) {
                            kanjisResult[i].value.query = kanjis[i];
                            kanjisEmbed.push(createKanjiEmbed(kanjisResult[i].value));
                        }
                        i++;
                    }

                    message.channel.send({ embeds: [phraseEmbed].concat(kanjisEmbed) });
                } else {
                    message.channel.send('Phrase not found');
                }

            } else {
                const result = await jisho.searchForKanji(args[0]);

                if (result.found) {
                    result.query = args[0];
                    const embed = createKanjiEmbed(result);

                    message.channel.send({ embeds: [embed] });
                } else {
                    message.channel.send('Kanji not found');
                }
            }

        } catch (error) {
            console.log(error);
            message.channel.send('An error occured while finding kanji');
        }
    },
};