import SlashCommands from './base';
import {getClientCommands} from './clientCommands';

// slash commands typeahead extension
class SlashCommandsClient extends SlashCommands {
    // typeahead extension
    type = 'typeahead'

    title = 'Commands'

    constructor(utils) {
        super();
        this.results = new utils.Rx.Subject();
        this.actions = new utils.Rx.Subject();
        this.utils = utils;
    }

    check(text) {
        return text.length >= 1 && /^\//.test(text) && !/\s/.test(text);
    }

    get({text, currentTeam, currentChannel}) {
        const search = text.slice(1, text.length);
        this.search = text;
        const req = this.utils.sign({
            text: search,
            currentTeam,
            currentChannel,
        });

        const clientCommands = getClientCommands();
        const clientCmds = Object.keys(clientCommands)
            .filter(key => key.toLowerCase().includes(search.toLowerCase()))
            .map(key => ({
                name: clientCommands[key].name,
                command: key,
            }));

        this.utils
            .post(`/ex/${this.extensionName}`, req)
            .map(res => res.commands)
            .map(commands => clientCmds.concat(commands).sort((a, b) => a.command.localeCompare(b.command)))
            .subscribe(commands => this.render(commands));
    }

    action(cmd) {
        this.actions.onNext({
            typeahead: `/${cmd.command}`,
            search: this.search,
        });
    }

    render(commands) {
        const {React} = this.utils;

        const results = commands.map(cmd => (
            <a className="panel-block typeahead-item" key={cmd.command} onClick={() => this.action(cmd)}>
                <span className="panel-icon">
                    <i className="fa fa-terminal" />
                </span>
                <strong>/{cmd.command}</strong>
                <span className="is-spacer" />
                {cmd.name}
            </a>
        ));

        this.results.onNext(results);
    }
}

// slash commands send intercept extension
class SlashCommandsSendClient extends SlashCommands {
    // send intercept extension
    type = 'clientSend'

    constructor(utils) {
        super();
        this.results = new utils.Rx.Subject();
        this.actions = new utils.Rx.Subject();
        this.utils = utils;
    }

    handleMessage(data) {
        // if doesn't start with / - return self
        if (!/^\//.test(data.message)) {
            return data;
        }

        const re = /^\/(.+?)[\s\n\r]+(.*)/g;
        const results = re.exec(data.message);
        // if couldn't parse - return self back
        if (!results) {
            return data;
        }

        const [, command, args] = results;
        const clientCommands = getClientCommands();
        // if no client command found - return self back
        if (!clientCommands[command]) {
            return data;
        }

        return clientCommands[command].execute({message: data, args, utils: this.utils});
    }
}

export default [SlashCommandsClient, SlashCommandsSendClient];
