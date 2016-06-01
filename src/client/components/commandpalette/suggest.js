const help = [{
    icon: 'fa-users',
    name: 'Join team',
    action({input}) {
        input.value = '%'; // eslint-disable-line
        input.focus();
    },
}, {
    icon: 'fa-hashtag',
    name: 'Join channel',
    action({input}) {
        input.value = '#'; // eslint-disable-line
        input.focus();
    },
}];

const channels = [{
    name: 'Start typing to get channel suggestions',
}];

const teams = [{
    name: 'Start typing to get team suggestions',
}];


export const suggestTypeahead = (command) => {
    if (command === '?') {
        return help;
    }

    if (/^#/.test(command)) {
        return channels;
    }

    if (/^%/.test(command)) {
        return teams;
    }

    return [];
};
