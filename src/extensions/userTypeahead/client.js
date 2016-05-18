import UserTypeahead from './base';
import attag from './markdown-it-attag';

// typeahead extension
class Client extends UserTypeahead {
    // typeahead extension
    type = 'typeahead'

    title = 'Users'

    markdownPlugins = [attag]

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
        this.search = search;
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

        const results = (
            <div className="menu">
                <ul className="menu-list">
                {users.map(user => (
                    <li key={user.id}>
                        <a onClick={() => this.action(user)}>
                            @{user.username}
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
