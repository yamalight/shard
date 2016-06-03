// sort by title
const orderBy = (attr) => (item1, item2) => {
    if (item1.get(attr) < item2.get(attr)) {
        return -1;
    }

    if (item1.get(attr) > item2.get(attr)) {
        return 1;
    }

    return 0;
};

// team update function
const updateTeam = (s, updates) => {
    const team = updates.get('team');
    let ns = s;
    // check if it's current team
    if (s.getIn(['currentTeam', 'id']) === team.get('id')) {
        ns = ns.set('currentTeam', s.get('currentTeam').merge(team));
    }
    // try to find in teams
    const teamsKey = ns.get('teams').findKey(v => v.get('id') === team.get('id'));
    // if found - update
    if (teamsKey) {
        ns = ns.setIn(['teams', teamsKey],
            ns.get('teams').find(v => v.get('id') === team.get('id')).merge(team)
        );
    } else { // if not - push new team
        ns = ns.set('teams', ns.get('teams').push(team).sort(orderBy('name')));
    }
    return ns;
};

// channel update function
const updateChannel = (s, updates) => {
    const channel = updates.get('channel')
        .delete('team') // leave team info out
        .delete('subchannels'); // leave subchannels out
    let ns = s;
    // check if it's current channel
    if (s.getIn(['currentChannel', 'id']) === channel.get('id')) {
        ns = s.set('currentChannel', s.get('currentChannel').merge(channel));
    }
    // try to find in channels
    let chKey = ns.get('channels').findKey(v => v.get('id') === channel.get('id'));
    // if found - update
    if (chKey) {
        ns = ns.setIn(['channels', chKey], ns.getIn(['channels', chKey]).merge(channel));
    } else { // try to find in subchannels
        let sKey = undefined;
        chKey = ns.get('channels').findKey(ch => {
            const k = ch.get('subchannels').findKey(v => v.get('id') === channel.get('id'));
            if (k !== undefined) {
                sKey = k;
            }
            return k !== undefined;
        });
        if (chKey !== undefined && sKey !== undefined) {
            ns = ns.setIn(['channels', chKey, 'subchannels', sKey],
                ns.getIn(['channels', chKey, 'subchannels', sKey]).merge(channel)
            );
        } else { // if not - push new channel
            ns = ns.set('channels', ns.get('channels').push(channel).sort(orderBy('name')));
        }
    }
    return ns;
};

// create combinator that updates state with given .updates prop
export const combinator = (state, data) => {
    const updates = data.get('updates');
    if (updates) {
        // console.log('*****************************************************');
        // console.log('=================== got updates ===================');
        // console.log(JSON.stringify(updates.toJS(), null, 2));
        // console.log('=================== old state ===================');
        // console.log(JSON.stringify(state.get('channels').toJS(), null, 2));

        const mergedState = state.merge(data).delete('updates');
        const newState = updates
            .keySeq()
            .reduce((s, key) => {
                // update teams if needed
                if (key === 'team') {
                    return updateTeam(s, updates);
                }

                if (key === 'channel') {
                    return updateChannel(s, updates);
                }

                return s;
            }, mergedState);

        // console.log('=================== new state ===================');
        // console.log(JSON.stringify(newState.get('channels').toJS(), null, 2));

        return newState;
    }
    return state.merge(data);
};
