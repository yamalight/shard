import React from 'react';
import styles from './chat.css';

import Description from '../description';
import Message from '../message/';
// import MessageShort from '../message-short';

import store$, {initChat, getChat, sendChat} from '../../store';

const Chat = React.createClass({
    getInitialState() {
        return {
            currentChannel: {},
            messagesRequested: false,
            messages: [],
        };
    },

    componentWillMount() {
        this.subs = [
            store$
            .map(s => s.filter((_, key) => ['messages', 'currentTeam', 'currentChannel'].includes(key)))
            .distinctUntilChanged()
            .map(s => s.toJS())
            .do(s => {
                if (this.state.messagesRequested) {
                    return;
                }

                if (s.currentTeam && s.currentChannel) {
                    const params = {
                        team: s.currentTeam._id,
                        channel: s.currentChannel._id,
                    };
                    // init connection
                    initChat(params);
                    // setup listener
                    getChat(params);
                    // set flag to not repeat that
                    this.setState({messagesRequested: true});
                }
            })
            .subscribe(s => this.setState(s)),
        ];
    },
    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    },

    sendMessage() {
        const message = this._text.value;
        const team = this.state.currentTeam._id;
        const channel = this.state.currentChannel._id;
        sendChat({team, channel, message});
    },

    render() {
        return (
            <div className={`column is-flex ${styles.mainarea}`}>
                <nav className={`navbar ${styles.navbar}`}>
                    <div className="navbar-item">
                        <p className={`title channel-name ${styles.title}`}>
                            {this.state.currentChannel.name || 'No channel selected'}
                        </p>
                    </div>
                </nav>

                <div ref="chatContainer" className={styles.section}>
                    <Description text={this.state.currentChannel.description || ''} />
                    {this.state.messages.length === 0 && 'No messages yet!'}
                    {this.state.messages.filter(m => m !== undefined).map(m => (
                        <Message
                            user={m.user.username}
                            time={m.time}
                            message={m.message}
                        />
                    ))}
                </div>
                <div className={styles.footer}>
                    <p className="control has-addons">
                        <a className="button">
                            <i className="fa fa-paperclip" />
                        </a>
                        <input
                            className="input"
                            type="text"
                            placeholder="Write a message..."
                            ref={(t) => { this._text = t; }}
                        />
                        <a className="button" onClick={this.sendMessage}>
                            <i className="fa fa-paper-plane" />
                        </a>
                    </p>
                </div>
            </div>
        );
    },
});

export default Chat;
