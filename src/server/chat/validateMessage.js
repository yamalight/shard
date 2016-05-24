import {logger} from '../util';

const MAX_SIZE = 100 * 1024; // 100 Kb

export const validateMessage = (message) => {
    // check for empty message
    if (!message.message || !message.message.length) {
        logger.debug('new message now saved because empty:', message);
        return {valid: false, status: 204};
    }
    // check for large message
    const size = Buffer.byteLength(message.message, 'utf8');
    if (size > MAX_SIZE) {
        return {valid: false, status: 413, error: 'Message text is too large! Limit is 100kb per message.'};
    }

    return {valid: true};
};
