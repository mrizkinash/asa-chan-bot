const fs = require('node:fs');

module.exports = (client) => {
    const commandFolders = fs.readdirSync('./commands/');

    for (const folder of commandFolders) {
        const commandFiles = fs.readdirSync(`./commands/${folder}/`);

        for (const file of commandFiles) {
            const command = require(`../commands/${folder}/${file}`);

            if (command.name) {
                client.commands.set(command.name, command);
            } else {
                continue;
            }
        }
    }
};