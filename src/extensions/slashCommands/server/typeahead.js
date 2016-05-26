import SlashCommands from '../base';

import {defaultCommands} from '../commands';

export default class SlashCommandsTypeaheadServer extends SlashCommands {
    constructor({route, util}) {
        super();

        this.commands = defaultCommands;

        const {logger} = util;

        route.post((req, res) => {
            const {text} = req.body;
            logger.debug('got command typeahead req:', text);

            const commands = Object.keys(this.commands)
                .filter(key => key.toLowerCase().includes(text.toLowerCase()))
                .map(key => ({
                    name: this.commands[key].name,
                    command: key,
                }));

            logger.debug(commands);

            res.send({commands});
        });
    }
}
