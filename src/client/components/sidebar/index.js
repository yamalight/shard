import _ from 'lodash';
import React from 'react';
import Portal from 'react-portal';
import {browserHistory} from 'react-router';
import shallowCompare from 'react-addons-shallow-compare';
import Mousetrap from 'mousetrap';
import styles from './sidebar.css';

// components
import Modal from '../modal';
import NewChannel from '../newchannel';
import Invite from '../invite';
import Userbar from '../userbar';
import JoinChannel from '../joinchannel';
import Dropdown from '../dropdown';
import EditTeam from '../editteam';
import NewConversation from '../newconversation';

// store and actions
import store$, {getChannels, getPublicChannels, setChannel, resetNewChannel} from '../../store';

// utils
import {meTeam} from '../../util';

export default class Sidebar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentTeam: {},
            channels: [],
            showCreateChannel: false,
            showCreateDM: false,
            showJoinChannel: false,
            showInvite: false,
            showEdit: false,
            joinChannel: undefined,
        };

        this.menuItems = [{
            title: 'Invite people',
            action: () => this.setState({showInvite: true}),
        }, {
            title: 'Edit team',
            action: () => this.setState({showEdit: true}),
        }, {
            type: 'separator',
        }, {
            title: 'Keyboard shortcuts',
            action: () => Mousetrap.trigger('ctrl+/'),
        }, {
            title: 'Markdown cheatsheet',
            action: () => Mousetrap.trigger('ctrl+shift+\\'),
        }];
    }

    componentWillMount() {
        this.subs = [
            // status sub
            store$
            .map(s => s.filter((v, key) => ['channelStatus'].includes(key)))
            .distinctUntilChanged(d => d, (a, b) => a.equals(b))
            .map(s => s.toJS())
            .subscribe(s => this.setState(s)),

            // team sub
            store$
            .map(s => s.filter((v, key) => ['currentTeam'].includes(key)))
            .distinctUntilChanged(d => d, (a, b) => a.equals(b))
            .map(s => s.toJS())
            .map(s => {
                let joinChannel = this.props.joinChannel || this.state.joinChannel;
                // request new channels if team changed
                if (s.currentTeam && s.currentTeam.id && this.state.currentTeam.id !== s.currentTeam.id) {
                    if (s.currentTeam.id !== meTeam.id) {
                        getChannels({team: s.currentTeam.id});
                        // force set join channel to general on team change
                        if (!joinChannel) {
                            joinChannel = 'general';
                        }
                    } else if (s.currentTeam.id === meTeam.id) {
                        getChannels({team: '', type: 'conversation'});
                    }
                }

                return {
                    ...s,
                    joinChannel,
                };
            })
            .subscribe(s => this.setState(s)),

            // data sub
            store$
            .map(s => s.filter((v, key) => [
                'currentChannel',
                'channels',
            ].includes(key)))
            .distinctUntilChanged(d => d, (a, b) => a.equals(b))
            .map(s => s.toJS())
            .subscribe(s => this.setState(s, () => setTimeout(() => {
                if (this.state.channels.length && this.state.joinChannel) {
                    const ch = _.flatten(this.state.channels.concat(this.state.channels.map(c => c.subchannels)))
                        .find(c => _.camelCase(c.name) === this.state.joinChannel);
                    if (ch) {
                        this.setChannel(ch);
                    } else {
                        this.setState({joinChannel: 'general'});
                    }
                }
            }, 100))),
        ];
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState);
    }

    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    }

    setChannel(channel) {
        setChannel(channel);
        this.setState({joinChannel: undefined});
    }

    closeCreateChannel() {
        // hide modal
        this.setState({showCreateChannel: false});
        // reset state
        resetNewChannel();
    }

    showJoinChannel() {
        getPublicChannels({team: this.state.currentTeam.id});
        this.setState({showJoinChannel: true});
    }

    closeJoinChannel() {
        // hide modal
        this.setState({showJoinChannel: false});
    }

    isCurrent(channel) {
        return this.state.currentChannel && this.state.currentChannel.id === channel.id;
    }

    closeInvite() {
        this.setState({showInvite: false});
    }

    closeTeamEdit(team) {
        // hide dialogue
        this.setState({showEdit: false});

        // if no team given - don't do anything
        if (!team) {
            return;
        }

        // update path
        const teamName = _.camelCase(team.name);
        const channel = _.camelCase(this.state.currentChannel.name);
        browserHistory.push(`/channels/${teamName}/${channel}`);
    }

    showCreateDM() {
        // getPublicChannels({team: this.state.currentTeam.id});
        this.setState({showCreateDM: true});
    }
    closeCreateDM() {
        this.setState({showCreateDM: false});
    }

    handleMenuItem(item) {
        item.action();
    }

    renderMenu() {
        if (!this.state.currentTeam.name) {
            return undefined;
        }

        return (
            <a
                className={styles.teamButton}
                onClick={(e) => this.setState({
                    showMenu: true,
                    menuStyle: {top: e.clientY, left: e.clientX, right: 'auto'},
                })}
            >
                <i className="fa fa-angle-down" />
            </a>
        );
    }

    renderHeader() {
        if (this.state.currentTeam.id === '@me') {
            return (
                <div className={styles.header}>
                    <header>
                        <span className={styles.teamName}>
                            Direct messages
                        </span>
                    </header>
                </div>
            );
        }

        return (
            <div className={styles.header}>
                <header>
                    <span className={styles.teamName}>
                        {this.state.currentTeam.name || 'No team selected'}
                    </span>

                    {this.renderMenu()}

                    {this.state.showMenu && (
                        <Dropdown
                            style={this.state.menuStyle}
                            title="Team"
                            items={this.menuItems}
                            onItem={it => this.handleMenuItem(it)}
                            onHide={() => this.setState({showMenu: false})}
                        />
                    )}
                </header>
            </div>
        );
    }

    renderChannelsHeader() {
        const {currentTeam} = this.state;
        if (currentTeam.id === meTeam.id) {
            return (
                <p className={`menu-label ${styles.channelsHeader}`}>
                    <a
                        className={`hint--bottom ${styles.channelsLabel}`}
                        data-hint="Start new conversation"
                        onClick={() => this.showCreateDM()}
                    >
                        Conversations
                    </a>
                </p>
            );
        }

        return (
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
        );
    }

    renderLoadingMessage() {
        if (this.state.channelStatus !== 'loading') {
            return null;
        }

        return (
            <li>
                <a>Loading...</a>
            </li>
        );
    }

    renderNoChannelsMessage() {
        const {channelStatus, channels, currentTeam} = this.state;

        if (channelStatus !== 'loading' && channels && channels.length === 0) {
            const msg = `You haven\'t joined any ${
                currentTeam.id === meTeam.id ? 'conversations' : 'channels'
            }! Join or create one?`;

            const clickFn = () => (
                currentTeam.id === meTeam.id ?
                this.showCreateDM() :
                this.showJoinChannel()
            );

            return (
                <li className="force-flex hint--right" data-hint={msg}>
                    <a onClick={clickFn}>{msg}</a>
                </li>
            );
        }

        return null;
    }

    renderChannels() {
        if (this.state.channelStatus === 'loading' || !this.state.channels) {
            return null;
        }

        return this.state.channels.map(channel => (
            <li key={channel.id}>
                <a
                    className={`force-flex ${styles.channelName} ${this.isCurrent(channel) && 'is-active'}`}
                    onClick={() => this.setChannel(channel)}
                >
                    <span className={`icon is-small ${styles.channelIcon}`}>
                        <i className={`fa ${channel.type === 'conversation' ? 'fa-user' : 'fa-hashtag'}`} />
                    </span>
                    {channel.name}
                    <span className="is-spacer" />
                    {channel.unread > 0 && (
                        <span className="tag is-dark is-small">
                            {channel.unread}
                        </span>
                    )}
                </a>
                {channel.subchannels && channel.subchannels.length > 0 && (
                    <ul>
                        {channel.subchannels.map(ch => (
                            <li key={ch.id}>
                                <a
                                    className={`force-flex ${styles.channelName} ${this.isCurrent(ch) && 'is-active'}`}
                                    onClick={() => this.setChannel(ch)}
                                >
                                    <span className={`icon is-small ${styles.channelIcon}`}>
                                        <i className="fa fa-hashtag" />
                                    </span>
                                    {ch.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </li>
        ));
    }

    render() {
        return (
            <aside className={styles.sidebar}>
                {this.renderHeader()}

                {this.state.currentTeam.name && (
                    <div className={`menu dark-menu ${styles.channels}`}>
                        {this.renderChannelsHeader()}
                        <ul className="menu-list">
                            {this.renderLoadingMessage()}
                            {this.renderNoChannelsMessage()}
                            {this.renderChannels()}
                        </ul>
                    </div>
                )}

                <div className="is-spacer" />

                {/* Userbar */}
                <Userbar />

                {/* Modal for channel creation */}
                {this.state.showCreateChannel && (
                    <Portal closeOnEsc onClose={() => this.closeCreateChannel()} isOpened>
                        <Modal closeAction={() => this.closeCreateChannel()}>
                            <NewChannel close={(refetch) => this.closeCreateChannel(refetch)} />
                        </Modal>
                    </Portal>
                )}

                {/* Modal for joining channel */}
                {this.state.showJoinChannel && (
                    <Portal closeOnEsc onClose={() => this.closeJoinChannel()} isOpened>
                        <Modal closeAction={() => this.closeJoinChannel()}>
                            <JoinChannel close={(refetch) => this.closeJoinChannel(refetch)} />
                        </Modal>
                    </Portal>
                )}

                {/* Modal for team invites */}
                {this.state.showInvite && (
                    <Portal closeOnEsc onClose={() => this.closeInvite()} isOpened>
                        <Modal closeAction={() => this.closeInvite()}>
                            <Invite close={() => this.closeInvite()} />
                        </Modal>
                    </Portal>
                )}

                {/* Modal for team edit */}
                {this.state.showEdit && (
                    <Portal closeOnEsc onClose={() => this.closeTeamEdit()} isOpened>
                        <Modal closeAction={() => this.closeTeamEdit()}>
                            <EditTeam close={t => this.closeTeamEdit(t)} />
                        </Modal>
                    </Portal>
                )}

                {/* Modal for user DM creation */}
                {this.state.showCreateDM && (
                    <Portal closeOnEsc onClose={() => this.closeCreateDM()} isOpened>
                        <Modal closeAction={() => this.closeCreateDM()}>
                            <NewConversation close={(refetch) => this.closeCreateDM(refetch)} />
                        </Modal>
                    </Portal>
                )}
            </aside>
        );
    }
}
