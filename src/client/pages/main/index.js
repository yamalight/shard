import _ from 'lodash';
import React from 'react';
import Dock from 'react-dock';
import styles from './main.css';

import store$, {setTeam, setChannel} from '../../store';

import Teambar from '../../components/teambar';
import Sidebar from '../../components/sidebar';
import Chat from '../../components/chat';
import Infobar from '../../components/infobar';

export default class Main extends React.Component {
    constructor(props) {
        super(props);
        const {channel, team} = props.params || {};

        this.state = {
            channel,
            team,
            teams: [],
            channels: [],
            showSidebar: true,
        };
    }

    componentWillMount() {
        this.subs = [
            store$
            .map(s => s.filter((v, key) => [
                'teams',
                'channels',
                'currentTeam',
                'currentChannel',
                'infobar',
            ].includes(key)))
            .distinctUntilChanged()
            .map(s => s.toJS())
            .subscribe(s => this.setState(s)),
        ];
    }

    componentDidMount() {
        setTimeout(() => this.updateTeamChannel(), 50);
    }

    componentWillReceiveProps({params}) {
        const {channel, team} = params || {};
        this.setState({channel, team});
    }

    componentDidUpdate() {
        setTimeout(() => this.updateTeamChannel(), 50);
    }

    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    }

    updateTeamChannel() {
        // set team if needed
        const currentTeam = this.state.teams.find(t => _.camelCase(t.name) === this.state.team);
        if (currentTeam && (!this.state.currentTeam || currentTeam.id !== this.state.currentTeam.id)) {
            setTeam(currentTeam);
        }

        // set channel if present
        const currentChannel = _.flatten(this.state.channels.concat(this.state.channels.map(ch => ch.subchannels)))
            .find(c => _.camelCase(c.name) === this.state.channel);
        if (currentChannel && (!this.state.currentChannel || currentChannel.id !== this.state.currentChannel.id)) {
            setChannel(currentChannel);
        }
    }

    toggleSidebar() {
        this.setState({showSidebar: !this.state.showSidebar});
    }

    render() {
        return (
            <div className={styles.app}>
                <Teambar toggleSidebar={() => this.toggleSidebar()} showSidebar={this.state.showSidebar} />
                {this.state.showSidebar && <Sidebar />}
                <Chat />
                {this.state.infobar && (
                    <Dock position="right" isVisible={!!this.state.infobar.content}>
                        <Infobar />
                    </Dock>
                )}
            </div>
        );
    }
}
