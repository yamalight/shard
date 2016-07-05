export default {
    hello: {
        name: 'Hello world',
        execute({util, args, channel}) {
            const message = `Hello ${args}!`;
            util.systemBot.sendMessage({message, channel});
            util.logger.info('saved new message.');
            return false;
        },
    },
};
