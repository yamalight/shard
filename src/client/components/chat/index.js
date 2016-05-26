import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import {Subject} from 'rx';
import {DOM} from 'rx-dom';
import styles from './chat.css';

// components
import Description from '../description';
import Message from '../message/';
import ChatInput from '../chatInput';
import Dropdown from '../dropdown';

// store and actions
import store$, {initChat, closeChat, getChat, getHistory, sendChat, setInfobar, markRead} from '../../store';

// utils
import {reduceShortMessages, focus} from '../../util';

export default class Chat extends React.Component {
    constructor(props) {
        super(props);

        this.unreadSubj = new Subject();
        this.state = {
            currentChannel: {},
            requestedForChannel: undefined,
            scrollToMessage: 'end',
            shouldScroll: false,
            messages: [],
            history: [],
            allMessages: [],
            chatStatus: undefined,
        };
    }

    componentWillMount() {
        this.subs = [
            // status
            store$
            .map(s => s.filter((v, key) => ['chatStatus'].includes(key)))
            .distinctUntilChanged(d => d, (a, b) => a.equals(b))
            .map(s => s.toJS())
            .subscribe(s => this.setState(s)),

            // get initial data
            store$
            .map(s => s.filter((v, key) => ['currentTeam', 'currentChannel'].includes(key)))
            .distinctUntilChanged(d => d, (a, b) => a.equals(b))
            .map(s => s.toJS())
            // reset all messages on changes
            .map(s => ({
                ...s,
                allMessages: [],
            }))
            .do(s => this.initSocket(s))
            // store to state
            .subscribe(s => this.setState(s)),

            // listen for history messages
            store$
            .map(s => s.get('history'))
            .filter(s => s !== undefined)
            .distinctUntilChanged(d => d, (a, b) => a.equals(b))
            .map(s => s.toJS())
            // map history
            .map(history => ({
                shouldScroll: true,
                allMessages: this.state.allMessages.concat(
                    history.filter(s => s !== undefined)
                    .reduce(reduceShortMessages, [])
                    .map(({replies, ...message}) => ({
                        ...message,
                        replies: replies.reduce(reduceShortMessages, []),
                    }))
                ).sort((m1, m2) => new Date(m1.time) - new Date(m2.time)),
            }))
            // say we need to mark new unread
            .do(() => this.unreadSubj.onNext())
            // store to state
            .subscribe(s => this.setState(s)),

            // listen for new messages
            store$
            .map(s => s.get('messages'))
            .filter(s => s !== undefined)
            .distinctUntilChanged(d => d, (a, b) => a.equals(b))
            .map(s => s.toJS())
            .subscribe(m => {
                const {allMessages: oldMessages} = this.state;
                // say we need to mark new unread
                this.unreadSubj.onNext();
                // reduce notify config
                const cfg = {
                    notifyAboutNew: !this._userActive,
                    team: this.state.currentTeam,
                    channel: this.state.currentChannel,
                };
                // if new message is not a reply - just fit it into allMessages
                if (!m.replyTo) {
                    const allMessages = reduceShortMessages(oldMessages, m, cfg);
                    this.setState({allMessages, scrollToMessage: 'end', shouldScroll: true});
                    return;
                }

                // if it's a reply, find parent and add it there
                const allMessages = oldMessages.map(msg => {
                    if (msg.id !== m.replyTo) {
                        return msg;
                    }

                    return {
                        ...msg,
                        replies: reduceShortMessages(msg.replies, m, cfg),
                    };
                });

                this.setState({allMessages, scrollToMessage: 'end', shouldScroll: true});
            }),

            // focus
            focus
            .startWith({active: true})
            .subscribe(({active}) => {
                // reschedule markUnread flag
                let rescheduleMarkUnread = false;
                if (!this._userActive) {
                    rescheduleMarkUnread = true;
                }
                // update active state
                this._userActive = active;
                // reschedule markUnread if needed
                if (rescheduleMarkUnread) {
                    this.unreadSubj.onNext();
                }
            }),

            // mark unread as read
            this.unreadSubj
            .debounce(3000)
            .subscribe(() => this.markUnread()),
        ];
    }
    componentDidMount() {
        this.subs.push(
            // listen for scrolling to top
            DOM.scroll(this.chatContainer)
            .debounce(300)
            .map(e => e.target.scrollTop)
            .filter(scrollTop => scrollTop === 0)
            .filter(() => this.state.allMessages && this.state.allMessages[0] !== undefined)
            .map(() => new Date(this.state.allMessages[0].time).getTime())
            .distinctUntilChanged()
            .subscribe(timestamp => {
                // construct request
                const params = {
                    team: this.state.currentTeam.id,
                    channel: this.state.currentChannel.id,
                    timestamp,
                };
                // say we need to scroll to the message after update
                this.setState({scrollToMessage: this.state.allMessages[0].id, shouldScroll: false});
                getHistory(params);
            }),
        );
    }
    componentDidUpdate() {
        this.scrollToMessage();
    }
    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    }

    initSocket(s) {
        if (s.currentTeam && s.currentTeam.id && s.currentChannel && s.currentChannel.id) {
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
    }

    scrollToMessage() {
        const {scrollToMessage, shouldScroll} = this.state;
        if (!shouldScroll || scrollToMessage === undefined || !this.state.allMessages.length) {
            return;
        }

        // get element
        const n = ReactDOM.findDOMNode(this.chatContainer);
        const scrollOffset = n.scrollHeight - n.scrollTop - n.offsetHeight;

        if (scrollToMessage === 'end') {
            setTimeout(() => {
                // only scroll if user is near bottom
                if (n.scrollTop === 0 || scrollOffset < 100) {
                    n.scrollTop = n.scrollHeight;
                }
                this.setState({scrollToMessage: undefined});
            }, 0);
            return;
        }

        setTimeout(() => {
            const el = n.querySelector(`#message-${this.state.scrollToMessage}`);
            if (el) {
                el.scrollIntoView();
            }
            this.setState({scrollToMessage: undefined});
        }, 0);
    }

    sendMessage() {
        const message = this._text.value;
        const team = this.state.currentTeam.id;
        const channel = this.state.currentChannel.id;
        sendChat({team, channel, message});
    }

    showMenu() {
        this.setState({showMenu: true});
    }
    handleMenuItem(item) {
        setInfobar(item);
    }
    closeMenu() {
        this.setState({showMenu: false});
    }

    markUnread() {
        if (!this._userActive) {
            return;
        }

        const messages = _.flatten(this.state.allMessages.concat(this.state.allMessages.map(m => m.moreMessages)))
            .filter(msg => msg !== undefined)
            .filter(msg => msg.isNew)
            .map(msg => msg.id);
        const rep = _.flatten(this.state.allMessages.map(msg => msg.replies))
            .filter(msg => msg !== undefined);
        const replies = _.flatten(rep.concat(rep.map(m => m.moreMessages)))
            .filter(msg => msg !== undefined)
            .filter(msg => msg.isNew)
            .map(msg => msg.id);

        // only send requests if there are any new messages
        if (!messages.length && !replies.length) {
            return;
        }

        const team = this.state.currentTeam.id;
        const channel = this.state.currentChannel.id;
        markRead({team, channel, messages, replies});
    }

    render() {
        const menuItems = [{
            title: 'Description',
            content: <Description text={this.state.currentChannel.description || ''} />,
        }];

        return (
            <div className={`column is-flex ${styles.mainarea}`}>
                <nav className={`navbar is-flex ${styles.navbar}`}>
                    <div className="navbar-item">
                        <p className={`title channel-name is-flex ${styles.title}`}>
                            {this.state.currentChannel.name || 'No channel selected'}
                        </p>
                    </div>

                    <div className={styles.navSpacer} />

                    <div className={`navbar-item is-flex ${styles.navMenu}`}>
                        <a className="card-header-icon" onClick={() => this.showMenu()}>
                            <i className="fa fa-angle-down" />
                        </a>
                    </div>

                    {this.state.showMenu && (
                        <Dropdown
                            style={{top: 50, right: 5}}
                            title="Channel"
                            items={menuItems}
                            onItem={it => this.handleMenuItem(it)}
                            onHide={() => this.closeMenu()}
                        />
                    )}
                </nav>

                <div ref={c => { this.chatContainer = c; }} className={styles.section}>
                    {this.state.chatStatus === 'loading' && 'Loading...'}

                    {this.state.chatStatus !== 'loading' &&
                        this.state.allMessages &&
                        this.state.allMessages.length === 0 && 'No messages yet!'}

                    {this.state.allMessages && this.state.allMessages.map(m => (
                        <Message key={m.id} {...m} />
                    ))}
                </div>
                <div className={styles.footer}>
                    <ChatInput {...this.state} />
                </div>
            </div>
        );
    }
}
