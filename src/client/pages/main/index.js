import _ from 'lodash';
import React from 'react';
// import Dock from 'react-dock';
import styles from './main.css';

import store$, {setTeam} from '../../store';

import Teambar from '../../components/teambar';
import Sidebar from '../../components/sidebar';
import ChatHeader from '../../components/chatHeader';
import Chat from '../../components/chat';
import ChatInput from '../../components/chatInput';
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
        // only update if needed
        if (channel !== this.state.channel || team !== this.state.team) {
            this.setState({channel, team});
        }
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
    }

    toggleSidebar() {
        this.setState({showSidebar: !this.state.showSidebar});
    }

    render() {
        return (
            <div className={styles.app}>
                {/* COL1: Teambar with teams */}
                <Teambar toggleSidebar={() => this.toggleSidebar()} showSidebar={this.state.showSidebar} />
                {/* COL2: Sidebar with channels, team menu, user info */}
                {this.state.showSidebar && <Sidebar joinChannel={this.state.channel} />}
                {/* COL3: Chat header, chat messages, inline infobar and chat input */}
                <div className={`column is-flex ${styles.mainarea}`}>
                    <ChatHeader />
                    <div className={`column is-flex ${styles.section}`}>
                        <Chat />
                        <Infobar />
                    </div>
                    <ChatInput />
                </div>
                {/* OVERLAY: infobar using overlay */}
                {/* this.state.infobar && (
                    <Dock position="right" isVisible={!!this.state.infobar.content}>
                        <Infobar />
                    </Dock>
                )*/}
            </div>
        );
    }
}
