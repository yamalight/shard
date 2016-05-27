import SlashCommands from '../base';

import {defaultCommands} from '../commands';

export default class SlashCommandsHandlerServer extends SlashCommands {
    // extension type
    type = 'messageHandler'

    // message access priority
    priority = 100

    constructor({db, util}) {
        super();

        this.db = db;
        this.util = util;

        // TODO: allow user-created commands
        this.commands = defaultCommands;
    }

    testMessage({message}) {
        return message.length > 1 && /^\//.test(message);
    }

    async handleMessage(m, context) {
        const {logger} = this.util;

        logger.debug('[slash]: processing message:', m);

        const re = /^\/(.+?)[\s\n\r]+(.*)/g;
        const results = re.exec(m.message);
        logger.debug('[slash]: processing results:', results);

        if (!results) {
            return m;
        }

        const [, command, args] = results;
        logger.debug(`[slash]: invoking "${command}" with "${args}"`);

        const fullContext = {
            ...context,
            db: this.db,
            util: this.util,
        };
        return this.commands[command].execute({message: m, args, ...fullContext});
    }
}
