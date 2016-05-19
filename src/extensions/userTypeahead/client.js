import UserTypeahead from './base';
import tag from '../../lib/markdown-it-tag';

// typeahead extension
class Client extends UserTypeahead {
    // typeahead extension
    type = 'typeahead'

    title = 'Users'

    markdownPlugins = [{
        plugin: tag,
        options: {
            tagSymbol: '@',
            urlPrefix: '/users/',
        },
    }]

    constructor(utils) {
        super();
        this.results = new utils.Rx.Subject();
        this.actions = new utils.Rx.Subject();
        this.utils = utils;
    }

    check(text) {
        const els = text.split('@');
        return els.length > 1 &&
            (!/\s/.test(els[els.length - 1]) || els[els.length - 1] === '');
    }

    get({text, currentTeam, currentChannel}) {
        const els = text.split('@');
        const search = els[els.length - 1];
        this.search = `@${search}`;
        const req = this.utils.sign({
            text: search,
            currentTeam,
            currentChannel,
        });
        this.utils
            .post(`/ex/${this.extensionName}`, req)
            .subscribe(res => this.render(res.users));
    }

    action(user) {
        this.actions.onNext({
            typeahead: `@${user.username}`,
            search: this.search,
        });
    }

    render(users) {
        const {React} = this.utils;

        const results = users.map(user => (
            <a className="panel-block" key={user.id} onClick={() => this.action(user)}>
                <span className="panel-icon">
                    <i className="fa fa-user" />
                </span>
                {user.username}
            </a>
        ));

        this.results.onNext(results);
    }
}

export default [Client];
