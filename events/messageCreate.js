require('dotenv').config();

module.exports = (client, message) => {
    const prefix = process.env.PREFIX;

    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const inputCommand = args.shift().toLowerCase();

    const clientCommand = client.commands.get(inputCommand) || client.commands.find(cmd => cmd.aliases?.includes(inputCommand));

    if (clientCommand) {
        try {
            clientCommand.execute(message, args, client);
        } catch (error) {
            message.channel.send('An error occured on command execution');
            console.error(error);
        }
    } else {
        message.channel.send(`Invalid command. To see list of commands use: \`\`\`${process.env.PREFIX}help\`\`\``);
    }
};