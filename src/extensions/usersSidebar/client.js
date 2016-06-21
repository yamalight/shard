import UsersSidebar from './base';
import createComponent from './component';

// sidebar extension
class UsersSidebarClient extends UsersSidebar {
    // sidebar extension
    type = 'sidebar'

    title = 'Users'

    chatSockets = {}

    constructor(utils) {
        super();
        this.utils = utils;
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
