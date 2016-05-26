import SlashCommands from './base';

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
        this.utils
            .post(`/ex/${this.extensionName}`, req)
            .subscribe(res => this.render(res.commands));
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

export default [SlashCommandsClient];
