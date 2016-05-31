import {logger} from '../util';

export const prepareMessageProcessors = (app) => {
    const currentExtensions = app.get('currentExtensions');
    const messageExtensions = currentExtensions.filter(ex => ex.type === 'messageHandler');

    return async ({message, team, channel, user}) => {
        // test message with extensions
        const extensions = messageExtensions
            .filter(ex => ex.testMessage(message))
            .sort((a, b) => a.priority - b.priority);
        logger.debug('got extensions that can handle message:', extensions.map(ex => ex.constructor.name));

        // transform message with matched extensions
        const context = {
            team,
            channel,
            user,
        };
        const finalMessage = await extensions.reduce((sum, ex) => ex.handleMessage(sum, context), message);
        logger.debug('final message after extensions is:', finalMessage);

        return finalMessage;
    };
};
