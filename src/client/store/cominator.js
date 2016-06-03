// create combinator that always returns new state
export const combinator = (state, data) => {
    const updates = data.get('updates');
    if (updates) {
        // console.log('*****************************************************')
        // console.log('=================== got updates ===================');
        // console.log(JSON.stringify(updates.toJS(), null, 2));
        // console.log('=================== old state ===================');
        // console.log(JSON.stringify(state.toJS(), null, 2));

        const mergedState = state.merge(data).delete('updates');
        const newState = updates
            .keySeq()
            .reduce((s, key) => {
                // update teams if needed
                if (key === 'team') {
                    const team = updates.get(key);
                    let ns = s;
                    // check if it's current team
                    if (s.getIn(['currentTeam', 'id']) === team.get('id')) {
                        ns = s.set('currentTeam', s.get('currentTeam').merge(team));
                    }
                    // try to find in teams
                    const teamsKey = s.get('teams').findKey(v => v.get('id') === team.get('id'));
                    // if found - update
                    if (teamsKey) {
                        ns = ns.setIn(['teams', teamsKey],
                            ns.get('teams').find(v => v.get('id') === team.get('id')).merge(team)
                        );
                    } else { // if not - push new team
                        ns = ns.set('teams', ns.get('teams').push(team));
                    }
                    return ns;
                }

                return s;
            }, mergedState);

        // console.log('=================== new state ===================');
        // console.log(JSON.stringify(newState.toJS(), null, 2));

        return newState;
    }
    return state.merge(data);
};
