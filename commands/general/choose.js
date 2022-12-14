module.exports = {
    name: 'choose',
    description: 'Randomly chooses one argument from all arguments',
    details: 'This command accepts 2 or more arguments and will randomly pick one of them. Useful when you need that last push on deciding something',
    execute(message, args, client) {
        if (args.length < 2) {
            message.channel.send(`Usage: \`\`\`${process.env.PREFIX}choose arg1 arg2 [arg3 argN]\`\`\``);
            return;
        }

        const border = 1.0 / args.length;
        const choice = Math.floor(Math.random() / border);

        message.channel.send(args[(choice < args.length) ? choice : args.length - 1]);
    },
};