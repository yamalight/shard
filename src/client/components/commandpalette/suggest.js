/* eslint no-param-reassign: 0 */
import {setTeam, setChannel} from '../../store';

const help = [{
    icon: 'fa-users',
    name: 'Switch team',
    action({input}) {
        input.value = '%';
        input.focus();
    },
}, {
    icon: 'fa-hashtag',
    name: 'Switch channel',
    action({input}) {
        input.value = '#';
        input.focus();
    },
}];

export const suggestTypeahead = (command, state) => {
    if (command === '?') {
        return help;
    }

    if (/^#/.test(command)) {
        const search = command.replace(/^#/, '').toLowerCase();
        return state.channels.filter(ch => ch.name.toLowerCase().includes(search))
            .map(ch => ({
                icon: 'fa-hashtag',
                name: ch.name,
                action({close}) {
                    setChannel(ch);
                    close();
                },
            }));
    }

    if (/^%/.test(command)) {
        const search = command.replace(/^%/, '').toLowerCase();
        return state.teams.filter(t => t.name.toLowerCase().includes(search))
            .map(t => ({
                icon: 'fa-users',
                name: t.name,
                action({close}) {
                    setTeam(t);
                    close();
                },
            }));
    }

    return [];
};
