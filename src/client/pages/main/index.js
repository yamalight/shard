import _ from 'lodash';
import React from 'react';
import styles from './main.css';

import store$, {setTeam, setChannel} from '../../store';

import Teambar from '../../components/teambar';
import Sidebar from '../../components/sidebar';
import Chat from '../../components/chat';

const Main = React.createClass({
    getInitialState() {
        const {channel, team} = this.props.params || {};
        return {
            channel,
            team,
            teams: [],
            channels: [],
        };
    },

    componentWillMount() {
        this.subs = [
            store$
            .map(s => s.filter((v, key) => ['teams', 'channels', 'currentTeam', 'currentChannel'].includes(key)))
            .distinctUntilChanged()
            .map(s => s.toJS())
            .subscribe(s => this.setState(s)),
        ];
    },

    componentDidMount() {
        this.updateTeamChannel();
    },

    componentWillReceiveProps({params}) {
        const {channel, team} = params || {};
        this.setState({channel, team});
    },

    componentDidUpdate() {
        this.updateTeamChannel();
    },

    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    },

    updateTeamChannel() {
        // set team if needed
        const currentTeam = this.state.teams.find(t => t.id === this.state.team);
        if (currentTeam && (!this.state.currentTeam || currentTeam.id !== this.state.currentTeam.id)) {
            setTeam(currentTeam);
        }

        // set channel if present
        const currentChannel = _.flatten(this.state.channels.concat(this.state.channels.map(ch => ch.subchannels)))
            .find(c => c.id === this.state.channel);
        if (currentChannel && (!this.state.currentChannel || currentChannel.id !== this.state.currentChannel.id)) {
            setChannel(currentChannel);
        }
    },

    render() {
        return (
            <div className={styles.app}>
                <Teambar />
                <Sidebar />
                <Chat />
            </div>
        );
    },
});

export default Main;
