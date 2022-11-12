module.exports = {
    name: 'hey',
    description: 'Greet your cute little sister',
    execute(message, args) {
        message.channel.send('Hey hey!');
    },
};