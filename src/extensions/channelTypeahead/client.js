import _ from 'lodash';
import ChannelsTypeahead from './base';
import tag from '../../lib/markdown-it-tag';

// typeahead extension
class Client extends ChannelsTypeahead {
    // typeahead extension
    type = 'typeahead'

    title = 'Channels'

    markdownPlugins = [{
        plugin: tag,
        options: {
            tagSymbol: '#',
            urlPrefix: `${window.location.pathname.split('/').slice(0, 3).join('/')}/`,
        },
    }]

    constructor(utils) {
        super();
        this.results = new utils.Rx.Subject();
        this.actions = new utils.Rx.Subject();
        this.utils = utils;
    }

    check(text) {
        const els = text.split('#');
        return els.length > 1 &&
            (!/\s/.test(els[els.length - 1]) || els[els.length - 1] === '');
    }

    get({text, currentTeam, currentChannel}) {
        const els = text.split('#');
        const search = els[els.length - 1];
        this.search = `#${search}`;
        const req = this.utils.sign({
            text: search,
            currentTeam,
            currentChannel,
        });
        this.utils
            .post(`/ex/${this.extensionName}`, req)
            .subscribe(res => this.render(res.channels));
    }

    action(channel) {
        const name = _.camelCase(channel.name);
        this.actions.onNext({
            typeahead: `#${name}`,
            search: this.search,
        });
    }

    render(channels) {
        const {React} = this.utils;

        const results = (
            <div className="menu">
                <ul className="menu-list">
                {channels.map(channel => (
                    <li key={channel.id}>
                        <a onClick={() => this.action(channel)}>
                            #{channel.name}
                        </a>
                    </li>
                ))}
                </ul>
            </div>
        );

        this.results.onNext(results);
    }
}

export default [Client];
