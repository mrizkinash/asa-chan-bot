module.exports = {
    name: 'hey',
    description: 'Greet your cute little sister',
    execute(client, message, args) {
        message.channel.send('Hey hey!');
    },
};