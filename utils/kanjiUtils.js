const { EmbedBuilder } = require('discord.js');

function isKanji(char) {
    return (char >= '\u4e00' && char <= '\u9faf') || (char >= '\u3400' && char <= '\u4dbf');
}

function isHiragana(char) {
    return (char >= '\u3041' && char <= '\u3096');
}

function isKatakana(char) {
    return (char >= '\u30A0' && char <= '30FF');
}

function isJapanese(char) {
    return (isHiragana(char) || isKatakana(char) || isKanji(char));
}

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
        .map(japanese => (japanese.word) ? japanese.word.concat(` (${japanese.reading})`) : japanese.reading)
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

function getPaginatedEmbed(embedList) {

    if (embedList.length !== 1) {
        let i = 1;
        for (const embed of embedList) {
            embed.setFooter({ text: `Page ${i} of ${embedList.length}` });
            i++;
        }
    }

    return embedList;
}

module.exports = {
    isKanji,
    isHiragana,
    isKatakana,
    isJapanese,
    createKanjiEmbed,
    createPhraseEmbed,
    getPaginatedEmbed,
};