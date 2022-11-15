const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Shows available commands',
    details: 'This command shows all commands Asa-chan bot has. ' +
        'You can also use ``help [command name]`` to get detailed information about specific commands',
    execute(message, args, client) {

        if (args.length > 1) {
            message.channel.send(`Usage: \`\`\`${process.env.PREFIX}help / ${process.env.PREFIX}help [command name]\`\`\``);
            return;
        }

        const embed = new EmbedBuilder();

        if (args.length === 0) {
            embed.setTitle('Available commands')
                .setDescription(`You can enter \`\`${process.env.PREFIX}help [command name]\`\` to get a more detailed info on each command`)
                .addFields(
                    { name: 'General', value: '``hey`` ``choose`` ``kanji`` ``help``' },
                    { name: 'Music', value: '``play`` ``pause`` ``unpause`` ``loop`` ``skip`` ``jump`` ``seek`` ``nowplaying`` ``queue`` ``remove`` ``stop``' },
                );

        } else {
            const command = client.commands.find(cmd => cmd.name === args[0]);

            if (!command) {
                message.channel.send(`Invalid command. To see list of commands use: \`\`\`${process.env.PREFIX}help\`\`\``);
                return;
            } else {

                if (command.aliases) {
                    embed.addFields({ name: 'Aliases', value: command.aliases.join(', ') });
                }

                embed.setTitle(`Command: ${command.name}`)
                    .addFields(
                        { name: 'Description', value: command.description },
                        { name: 'Details', value: command.details || 'No additional details specified' },
                    );
            }

        }

        message.channel.send({ embeds: [embed] });
    },
};