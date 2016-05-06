import React from 'react';
import styles from './chat.css';

import Description from '../description';
import Message from '../message/';
// import MessageShort from '../message-short';

import store$, {initChat, getChat, getHistory, sendChat} from '../../store';

const Chat = React.createClass({
    getInitialState() {
        return {
            currentChannel: {},
            messagesRequested: false,
            messages: [],
            history: [],
        };
    },

    componentWillMount() {
        this.subs = [
            store$
            .map(s => s.filter((_, key) => ['history', 'messages', 'currentTeam', 'currentChannel'].includes(key)))
            .distinctUntilChanged()
            .map(s => s.toJS())
            .do(s => {
                if (this.state.messagesRequested) {
                    return;
                }

                if (s.currentTeam && s.currentChannel) {
                    const params = {
                        team: s.currentTeam.id,
                        channel: s.currentChannel.id,
                    };
                    // init connection
                    initChat(params);
                    // get history
                    getHistory(params);
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
        const team = this.state.currentTeam.id;
        const channel = this.state.currentChannel.id;
        sendChat({team, channel, message});
    },

    allMessages() {
        return this.state.history.concat(this.state.messages);
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
                    {this.allMessages().length === 0 && 'No messages yet!'}
                    {this.allMessages().filter(m => m !== undefined).map(m => (
                        <Message
                            key={m.id}
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
