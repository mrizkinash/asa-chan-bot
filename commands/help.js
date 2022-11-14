const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Shows available commands',
    execute(message, args, client) {
        const embed = new EmbedBuilder()
            .setTitle('Available commands')
            .addFields(
                { name: 'General', value: '``hey`` ``choose`` ``kanji``' },
                { name: 'Music', value: '``play`` ``pause`` ``unpause`` ``skip`` ``jump`` ``nowplaying`` ``queue`` ``stop``' },
            );

        message.channel.send({ embeds: [embed] });
    },
};