const JishoAPI = require('unofficial-jisho-api');
const { EmbedBuilder } = require('discord.js');
// TODO: Add reaction to give examples of words starting, ending, or containing the kanji
function createKanjiEmbed(data) {
    const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle(data.query)
        .setURL(data.uri)
        .addFields(
            { name: 'JLPT Level', value: (data.jlptLevel || 'Unknown'), inline: true },
            { name: 'Stroke Count', value: String(data.strokeCount), inline: true },
            { name: 'Meaning', value: data.meaning },
            { name: 'Kunyomi', value: data.kunyomi.join(', '), inline: true },
            { name: 'Onyomi', value: data.onyomi.join(', '), inline: true },
            { name: '\u200b', value: '\u200b', inline: true },
            { name: 'Radical', value: data.radical.meaning.concat(' ', data.radical.symbol), inline: true },
            { name: 'Parts', value: data.parts.join(', '), inline: true },
            { name: '\u200b', value: '\u200b', inline: true },
        )
        .setImage(data.strokeOrderGifUri);

    return embed;
}
// TO DO: Make it possible to search individual kanji in the phrase
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

module.exports = {
    name: 'kanji',
    description: 'Search for a kanji/phrase in Jisho',
    async execute(client, message, args) {
        if (args.length != 1) {
            message.channel.send('Usage: ```!kanji [kanji/japanese phrase]```');
            return;
        }

        const jisho = new JishoAPI();

        if (args[0].length > 1) {
            const [result, extraResult] =
                await Promise.all([jisho.searchForPhrase(args[0]), jisho.scrapeForPhrase(args[0])]);

            if (result.meta.status == 200) {
                result.data[0].uri = extraResult?.uri;
                const embed = createPhraseEmbed(result.data[0]);

                message.channel.send({ embeds: [embed] });
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
    },
};