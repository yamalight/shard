import UsersSidebar from './base';
import createComponent from './component';

// sidebar extension
class UsersSidebarClient extends UsersSidebar {
    // sidebar extension
    type = 'sidebar'

    title = 'Users'

    constructor(utils) {
        super();
        console.log(utils);
        this.utils = utils;
    }

    getUsers({team, channel}) {
        const req = this.utils.sign({team, channel});
        return this.utils.post(`/ex/${this.extensionName}`, req);
    }

    content() {
        const {store$, React} = this.utils;
        const extension = this;

        const Comp = createComponent({React, store$, extension});

        return <Comp />;
    }
}

export default [UsersSidebarClient];
