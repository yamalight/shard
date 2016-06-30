import CalendarSidebar from './base';
import createComponent from './component';

// sidebar extension
class CalendarSidebarClient extends CalendarSidebar {
    // sidebar extension
    type = 'sidebar'

    id = 'calendar'
    title = 'Calendar'

    constructor(utils) {
        super();
        this.utils = utils;

        // listen for global activation requests
        utils
        .store$
        .map(s => s.get('activateInfobar'))
        .filter(s => s !== undefined)
        .filter(it => it === 'calendar')
        .delay(10) // <- this is needed to prevent infobar jumping to previous state
        .subscribe(() => utils.storeActions.setInfobar({
            id: 'calendar',
            title: 'Calendar',
            content: () => this.content(),
        }));

        // add self to slash commands
        window.shardApp.slashCommands.calendar = {
            name: 'Show calendar',
            execute({utils: execUtils}) {
                execUtils.storeActions.activateInfobar('calendar');
                return false;
            },
        };
    }

    getCalendar({team, channel}) {
        const {token} = this.utils.sign({});
        const encTeam = encodeURIComponent(team);
        const encChannel = encodeURIComponent(channel);
        return this.utils.get(`/ex/${this.extensionName}?team=${encTeam}&channel=${encChannel}`, token);
    }

    setCalendar({team, channel, calendar}) {
        const data = this.utils.sign({team, channel, calendar});
        return this.utils.post(`/ex/${this.extensionName}`, data);
    }

    content() {
        const {store$, React} = this.utils;
        const extension = this;

        const Comp = createComponent({React, store$, extension});

        return <Comp />;
    }
}

export default [CalendarSidebarClient];
