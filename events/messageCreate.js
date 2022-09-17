module.exports = (client, message) => {
    const prefix = '!';

    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const inputCommand = args.shift().toLowerCase();

    const clientCommand = client.commands.get(inputCommand);

    if (clientCommand) clientCommand.execute(client, message, args);
};