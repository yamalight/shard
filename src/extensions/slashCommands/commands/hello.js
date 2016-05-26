export default {
    hello: {
        name: 'Hello world',
        execute({message, args}) {
            message.message = `__I say:__ "Hello ${args}!"`; // eslint-disable-line
            return message;
        },
    },
};
