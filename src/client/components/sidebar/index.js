import React from 'react';
import Portal from 'react-portal';
import store$, {getChannels, setChannel} from '../../store';
import styles from './sidebar.css';

import Modal from '../modal';
import NewChannel from '../newchannel';
import Invite from '../invite';

const Sidebar = React.createClass({
    getInitialState() {
        return {
            currentTeam: {},
            channels: [],
            showCreateChannel: false,
            showInvite: false,
        };
    },

    componentWillMount() {
        this.subs = [
            store$
            .map(s => s.filter((_, key) => ['currentTeam', 'currentChannel', 'channels'].includes(key)))
            .distinctUntilChanged()
            .map(s => s.toJS())
            .subscribe(s => this.setState(s)),
            // request channels once you have team
            store$
            .map(s => s.get('currentTeam'))
            .filter(s => s !== undefined)
            .map(s => s.toJS())
            .distinctUntilChanged()
            .subscribe(currentTeam => getChannels({team: currentTeam.id})),
        ];
    },
    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    },

    closeCreateChannel(refetch = false) {
        this.setState({showCreateChannel: false});
        if (refetch) {
            getChannels({team: this.state.currentTeam.id});
        }
    },

    isCurrent(channel) {
        return this.state.currentChannel && this.state.currentChannel.id === channel.id;
    },

    invitePeople() {
        this.setState({showInvite: true});
    },
    closeInvite() {
        this.setState({showInvite: false});
    },

    render() {
        return (
            <aside className={styles.sidebar}>
                <div className={styles.header}>
                    <header>
                        <span className={styles.teamName}>
                            {this.state.currentTeam.name || 'No team selected'}
                        </span>
                        {this.state.currentTeam.name && (
                            <a
                                className={`${styles.teamButton} hint--bottom`}
                                data-hint="Invite people"
                                onClick={this.invitePeople}
                            >
                                <i className="fa fa-share-square-o" />
                            </a>
                        )}
                    </header>
                </div>

                {this.state.currentTeam.name && (
                    <div className={`menu dark-menu ${styles.channels}`}>
                        <p className="menu-label">
                            <a
                                className={styles.channelsHeader}
                                onClick={() => this.setState({showCreateChannel: true})}
                            >
                                Channels
                                <span className={styles.separator} />
                                <span className="icon is-small">
                                    <i className="fa fa-plus" />
                                </span>
                            </a>
                        </p>
                        <ul className="menu-list">
                            {this.state.channels && this.state.channels.length === 0 && (
                                <li>
                                    No channels found! Add one?
                                </li>
                            )}
                            {this.state.channels && this.state.channels.map(channel => (
                                <li key={channel.id}>
                                    <a
                                        className={`channel-name ${this.isCurrent(channel) && 'is-active'}`}
                                        onClick={() => setChannel(channel)}
                                    >
                                        {channel.name}
                                    </a>
                                    <ul>
                                        {channel.subchannels && channel.subchannels.map(ch => (
                                            <li>
                                                <a className="channel-name">{ch.name}</a>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Modal for team creation */}
                <Portal closeOnEsc onClose={this.closeCreateChannel} isOpened={this.state.showCreateChannel}>
                    <Modal closeAction={this.closeCreateChannel}>
                        <NewChannel close={this.closeCreateChannel} />
                    </Modal>
                </Portal>

                {/* Modal for team invites */}
                <Portal closeOnEsc onClose={this.closeInvite} isOpened={this.state.showInvite}>
                    <Modal closeAction={this.closeInvite}>
                        <Invite close={this.closeInvite} />
                    </Modal>
                </Portal>
            </aside>
        );
    },
});

export default Sidebar;
