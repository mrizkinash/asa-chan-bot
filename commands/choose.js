module.exports = {
    name: 'choose',
    description: 'Randomly chooses one argument from all arguments',
    execute(message, args) {
        if (args.length < 2) {
            message.channel.send('Usage: ```!choose arg1 arg2 [arg3 argN]```');
            return;
        }

        const border = 1.0 / args.length;
        const choice = Math.floor(Math.random() / border);

        message.channel.send(args[(choice < args.length) ? choice : args.length - 1]);
    },
};