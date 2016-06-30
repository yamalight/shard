import UsersSidebar from './base';
import createComponent from './component';

// sidebar extension
class UsersSidebarClient extends UsersSidebar {
    // sidebar extension
    type = 'sidebar'

    id = 'userslist'
    title = 'Users'

    chatSockets = {}

    constructor(utils) {
        super();
        this.utils = utils;

        // listen for global activation requests
        utils
        .store$
        .map(s => s.get('activateInfobar'))
        .filter(s => s !== undefined)
        .distinctUntilChanged()
        .filter(it => it === 'users')
        .delay(10) // <- this is needed to prevent infobar jumping to previous state
        .subscribe(() => {
            utils.storeActions.setInfobar({
                id: 'users',
                title: 'Users',
                content: () => this.content(),
            });
            utils.storeActions.activateInfobar(undefined);
        });

        // add self to slash commands
        window.shardApp.slashCommands.users = {
            name: 'Show users list',
            execute({utils: execUtils}) {
                execUtils.storeActions.activateInfobar('users');
                return false;
            },
        };
    }

    getUsers({team, channel}) {
        const req = this.utils.sign({team, channel});
        return this.utils.post(`/ex/${this.extensionName}`, req);
    }

    initUsersStream({team, channel}) {
        if (this.chatSockets[team + channel] && !this.chatSockets[team + channel].isStopped) {
            return this.chatSockets[team + channel];
        }

        const url = `/ex/${this.extensionName}?channel=${channel}`;
        this.chatSockets[team + channel] = this.utils.socket(url);
        return this.chatSockets[team + channel];
    }

    content() {
        const {store$, React} = this.utils;
        const extension = this;

        const Comp = createComponent({React, store$, extension});

        return <Comp />;
    }
}

export default [UsersSidebarClient];
