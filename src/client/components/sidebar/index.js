import _ from 'lodash';
import React from 'react';
import Portal from 'react-portal';
import {browserHistory} from 'react-router';
import styles from './sidebar.css';

// components
import Modal from '../modal';
import NewChannel from '../newchannel';
import Invite from '../invite';

// store and actions
import store$, {getChannels, setChannel, resetNewChannel} from '../../store';

export default class Sidebar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentTeam: {},
            channels: [],
            showCreateChannel: false,
            showInvite: false,
            joinChannel: undefined,
        };
    }

    componentWillMount() {
        this.subs = [
            // status sub
            store$
            .map(s => s.filter((v, key) => ['channelStatus'].includes(key)))
            .distinctUntilChanged(d => d, (a, b) => a.equals(b))
            .map(s => s.toJS())
            .subscribe(s => this.setState(s)),

            // data sub
            store$
            .map(s => s.filter((v, key) => [
                'currentTeam',
                'currentChannel',
                'channels',
            ].includes(key)))
            .distinctUntilChanged(d => d, (a, b) => a.equals(b))
            .map(s => s.toJS())
            .map(s => {
                let joinChannel = this.state.joinChannel;
                // request new channels if team changed
                if (s.currentTeam && s.currentTeam.id &&
                    this.state.currentTeam.id !== s.currentTeam.id &&
                    this.state.joinChannel !== 'general'
                ) {
                    joinChannel = 'general';
                    getChannels({team: s.currentTeam.id});
                }

                return {
                    ...s,
                    joinChannel,
                };
            })
            .subscribe(s => this.setState(s)),
        ];
    }

    componentDidUpdate() {
        setTimeout(() => {
            if (this.state.channels.length && this.state.joinChannel) {
                const ch = this.state.channels.find(c => c.name === this.state.joinChannel);
                this.setChannel(ch);
            }
        }, 10);
    }

    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    }

    setChannel(channel) {
        setChannel(channel);
        const team = _.camelCase(this.state.currentTeam.name);
        const ch = _.camelCase(channel.name);
        browserHistory.push(`/channels/${team}/${ch}`);
        this.setState({joinChannel: undefined});
    }

    closeCreateChannel(refetch = false) {
        // hide modal
        this.setState({showCreateChannel: false});
        // reset state
        resetNewChannel();
        // refetch channels if needed
        if (refetch) {
            getChannels({team: this.state.currentTeam.id, refetch});
        }
    }

    isCurrent(channel) {
        return this.state.currentChannel && this.state.currentChannel.id === channel.id;
    }

    invitePeople() {
        this.setState({showInvite: true});
    }
    closeInvite() {
        this.setState({showInvite: false});
    }

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
                                onClick={() => this.invitePeople()}
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
                            {this.state.channelStatus === 'loading' && (
                                <li>
                                    <a>Loading channels...</a>
                                </li>
                            )}
                            {this.state.channelStatus !== 'loading' &&
                            this.state.channels &&
                            this.state.channels.length === 0 && (
                                <li>
                                    <a>No channels found! Add one?</a>
                                </li>
                            )}
                            {this.state.channels && this.state.channels.map(channel => (
                                <li key={channel.id}>
                                    <a
                                        className={`channel-name ${this.isCurrent(channel) && 'is-active'}`}
                                        onClick={() => this.setChannel(channel)}
                                    >
                                        {channel.name}
                                    </a>
                                    {channel.subchannels && channel.subchannels.length > 0 && (
                                        <ul>
                                            {channel.subchannels.map(ch => (
                                                <li key={ch.id}>
                                                    <a
                                                        className={`channel-name ${this.isCurrent(ch) && 'is-active'}`}
                                                        onClick={() => this.setChannel(ch)}
                                                    >
                                                        {ch.name}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Modal for channel creation */}
                <Portal closeOnEsc onClose={() => this.closeCreateChannel()} isOpened={this.state.showCreateChannel}>
                    <Modal closeAction={() => this.closeCreateChannel()}>
                        <NewChannel close={(refetch) => this.closeCreateChannel(refetch)} />
                    </Modal>
                </Portal>

                {/* Modal for team invites */}
                <Portal closeOnEsc onClose={() => this.closeInvite()} isOpened={this.state.showInvite}>
                    <Modal closeAction={() => this.closeInvite()}>
                        <Invite close={() => this.closeInvite()} />
                    </Modal>
                </Portal>
            </aside>
        );
    }
}
