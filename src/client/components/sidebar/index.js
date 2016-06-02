import React from 'react';
import Portal from 'react-portal';
import styles from './sidebar.css';

// components
import Modal from '../modal';
import NewChannel from '../newchannel';
import Invite from '../invite';
import Userbar from '../userbar';
import JoinChannel from '../joinchannel';

// store and actions
import store$, {getChannels, getPublicChannels, setChannel, resetNewChannel} from '../../store';

export default class Sidebar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentTeam: {},
            channels: [],
            showCreateChannel: false,
            showJoinChannel: false,
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
                let joinChannel = this.props.joinChannel || this.state.joinChannel;
                // request new channels if team changed
                if (s.currentTeam && s.currentTeam.id && this.state.currentTeam.id !== s.currentTeam.id) {
                    getChannels({team: s.currentTeam.id});
                    // force set join channel to general on team change
                    if (!joinChannel) {
                        joinChannel = 'general';
                    }
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
                if (ch) {
                    this.setChannel(ch);
                } else {
                    this.setState({joinChannel: 'general'});
                }
            }
        }, 10);
    }

    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    }

    setChannel(channel) {
        setChannel(channel);
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

    showJoinChannel() {
        getPublicChannels({team: this.state.currentTeam.id});
        this.setState({showJoinChannel: true});
    }

    closeJoinChannel(ch) {
        // refetch channels if needed
        if (ch) {
            // hide modal and say we want to join new channel
            this.setState({showJoinChannel: false});
            // set channel
            this.setChannel(ch);
            // get channels
            getChannels({team: this.state.currentTeam.id, refetch: true});
            return;
        }

        // hide modal
        this.setState({showJoinChannel: false});
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
                        <p className={`menu-label ${styles.channelsHeader}`}>
                            <a
                                className={`hint--bottom ${styles.channelsLabel}`}
                                data-hint="Join existing channel"
                                onClick={() => this.showJoinChannel()}
                            >
                                Channels
                            </a>
                            <span className={styles.separator} />
                            <a
                                className="hint--bottom"
                                data-hint="Create new channel"
                                onClick={() => this.setState({showCreateChannel: true})}
                            >
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

                <div className="is-spacer" />

                {/* Userbar */}
                <Userbar />

                {/* Modal for channel creation */}
                <Portal closeOnEsc onClose={() => this.closeCreateChannel()} isOpened={this.state.showCreateChannel}>
                    <Modal closeAction={() => this.closeCreateChannel()}>
                        <NewChannel close={(refetch) => this.closeCreateChannel(refetch)} />
                    </Modal>
                </Portal>

                {/* Modal for joining channel */}
                <Portal closeOnEsc onClose={() => this.closeJoinChannel()} isOpened={this.state.showJoinChannel}>
                    <Modal closeAction={() => this.closeJoinChannel()}>
                        <JoinChannel close={(refetch) => this.closeJoinChannel(refetch)} />
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
