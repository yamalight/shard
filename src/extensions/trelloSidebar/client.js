import TrelloSidebar from './base';
import createComponent from './component';

// sidebar extension
class TrelloSidebarClient extends TrelloSidebar {
    // sidebar extension
    type = 'sidebar'

    id = 'trello'
    title = 'Trello'

    constructor(utils) {
        super();
        this.utils = utils;

        // listen for global activation requests
        utils
        .store$
        .map(s => s.get('activateInfobar'))
        .filter(s => s !== undefined)
        .distinctUntilChanged()
        .filter(it => it === 'trello')
        .delay(10) // <- this is needed to prevent infobar jumping to previous state
        .subscribe(() => {
            utils.storeActions.setInfobar({
                id: 'trello',
                title: 'Trello',
                content: () => this.content(),
            });
            utils.storeActions.activateInfobar(undefined);
        });

        // add self to slash commands
        window.shardApp.slashCommands.trello = {
            name: 'Show trello board',
            execute({utils: execUtils}) {
                execUtils.storeActions.activateInfobar('trello');
                return false;
            },
        };
    }

    getBoard({team, channel}) {
        const {token} = this.utils.sign({});
        const encTeam = encodeURIComponent(team);
        const encChannel = encodeURIComponent(channel);
        return this.utils.get(`/ex/${this.extensionName}?team=${encTeam}&channel=${encChannel}`, token);
    }

    setBoard({team, channel, board}) {
        const data = this.utils.sign({team, channel, board});
        return this.utils.post(`/ex/${this.extensionName}`, data);
    }

    content() {
        const {store$, React} = this.utils;
        const extension = this;

        const Comp = createComponent({React, store$, extension});

        return <Comp />;
    }
}

export default [TrelloSidebarClient];
