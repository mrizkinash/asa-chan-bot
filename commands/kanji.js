const JishoAPI = require('unofficial-jisho-api');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'kanji',
    description: 'Search for a kanji in Jisho, gives results in embed for single kanjis, sends jisho url for phrases',
    async execute(client, message, args) {
        if (args.length != 1) {
            message.channel.send('Usage: ```!kanji [kanji/japanese phrase]```');
            return;
        }

        const jisho = new JishoAPI();
        // TODO: Make it not only send link to jisho but give the contents instead
        if (args[0].length > 1) {
            const result = await jisho.scrapeForPhrase(args[0]);

            if (result.found) {
                message.channel.send(result.uri);
            } else {
                message.channel.send('Phrase not found');
            }
        } else {
            const result = await jisho.searchForKanji(args[0]);

            if (result.found) {
                const embed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle(args[0])
                    .setURL(result.uri)
                    .addFields(
                        { name: 'JLPT Level', value: (result.jlptLevel || 'Unknown'), inline: true },
                        { name: 'Stroke Count', value: String(result.strokeCount), inline: true },
                        { name: 'Meaning', value: result.meaning },
                        { name: 'Kunyomi', value: result.kunyomi.join(', '), inline: true },
                        { name: 'Onyomi', value: result.onyomi.join(', '), inline: true },
                        { name: 'Radical', value: result.radical.meaning.concat(' ', result.radical.symbol) },
                    )
                    .setImage(result.strokeOrderGifUri);

                message.channel.send({ embeds: [embed] });

                // TODO: Add reaction to give examples of words starting, ending, or containing the kanji
            } else {
                message.channel.send('Kanji not found');
            }
        }
    },
};