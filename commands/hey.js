module.exports = {
    name: 'hey',
    description: 'Greet your cute little sister',
    execute(message, args, client) {
        message.channel.send('Hey hey!');
    },
};