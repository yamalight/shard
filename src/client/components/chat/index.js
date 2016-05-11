import React from 'react';
import ReactDOM from 'react-dom';
import styles from './chat.css';

import Description from '../description';
import Message from '../message/';
import ChatInput from '../chatInput';

import store$, {initChat, closeChat, getChat, getHistory, sendChat} from '../../store';

import {reduceShortMessages} from '../../util';

const Chat = React.createClass({
    getInitialState() {
        return {
            currentChannel: {},
            requestedForChannel: undefined,
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
                if (s.currentTeam && s.currentChannel) {
                    // if already opened for this chat - ignore action
                    if (this.state.requestedForChannel === (s.currentTeam.id + s.currentChannel.id)) {
                        return;
                    }

                    // if another socket exists - close it
                    if (this.state.requestedForChannel) {
                        closeChat(this.state.requestedForChannel);
                    }

                    // construct request
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
                    this.setState({requestedForChannel: s.currentTeam.id + s.currentChannel.id});
                }
            })
            .map(({history = [], messages = [], ...rest}) => ({
                ...rest,
                allMessages: reduceShortMessages(history.concat(messages))
                    .map(({replies, ...message}) => ({
                        ...message,
                        replies: reduceShortMessages(replies),
                    })),
            }))
            .subscribe(s => this.setState(s)),
        ];
    },
    componentDidUpdate() {
        this.scrollToBottom();
    },
    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    },

    scrollToBottom() {
        const n = ReactDOM.findDOMNode(this.chatContainer);
        n.scrollTop = n.scrollHeight;
    },

    sendMessage() {
        const message = this._text.value;
        const team = this.state.currentTeam.id;
        const channel = this.state.currentChannel.id;
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

                <div ref={c => { this.chatContainer = c; }} className={styles.section}>
                    <Description text={this.state.currentChannel.description || ''} />
                    {this.state.allMessages.length === 0 && 'No messages yet!'}
                    {this.state.allMessages.map(m => (
                        <Message key={m.id} {...m} />
                    ))}
                </div>
                <div className={styles.footer}>
                    <ChatInput {...this.state} />
                </div>
            </div>
        );
    },
});

export default Chat;
