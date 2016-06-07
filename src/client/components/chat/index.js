import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import {Subject} from 'rx';
import {DOM} from 'rx-dom';
import moment from 'moment';
import styles from './chat.css';

// components
import Message from '../message/';

// store and actions
import store$, {initChat, closeChat, getChat, getHistory, markRead, editSelectedMessage} from '../../store';

// utils
import {reduceShortMessages, addReplyMessage, focus} from '../../util';

export default class Chat extends React.Component {
    constructor(props) {
        super(props);

        const authedUser = JSON.parse(localStorage.getItem('user'));

        this.unreadSubj = new Subject();
        this.state = {
            currentChannel: {},
            requestedForChannel: undefined,
            scrollToMessage: 'end',
            shouldScroll: false,
            allMessages: undefined,
            chatStatus: undefined,
            authedUser,
        };
    }

    componentWillMount() {
        this.subs = [
            // status
            store$
            .map(s => s.get('chatStatus'))
            .distinctUntilChanged()
            .subscribe(chatStatus => this.setState({chatStatus})),

            // get initial data
            store$
            .map(s => s.filter((v, key) => ['currentTeam', 'currentChannel'].includes(key)))
            .distinctUntilChanged(d => d, (a, b) =>
                a.getIn(['currentTeam', 'id']) === b.getIn(['currentTeam', 'id']) &&
                a.getIn(['currentChannel', 'id']) === b.getIn(['currentChannel', 'id'])
            )
            .map(s => s.toJS())
            // reset all messages on changes
            .map(s => ({
                ...s,
                scrollToMessage: 'end',
                allMessages: undefined,
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
                allMessages: (this.state.allMessages || []).concat(
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
                const allMessages = addReplyMessage(oldMessages, m, cfg);

                this.setState({allMessages, scrollToMessage: 'end', shouldScroll: true});
            }),

            // last message edit requests
            store$
            .map(s => s.get('editLastMessage'))
            .filter(edit => edit)
            .subscribe(() => {
                // edit last message
                const {allMessages, authedUser} = this.state;
                const ownedByUser = it => it.user.id === authedUser.id;
                // find top index
                const topIdx = _.findLastIndex(allMessages, ownedByUser);
                const top = allMessages[topIdx];
                const res = [top];
                // check more message
                const moreIdx = _.findLastIndex(top.moreMessages, ownedByUser);
                if (moreIdx !== -1) {
                    const more = top.moreMessages[moreIdx];
                    res.push(more);
                }
                // check replies
                const replyIdx = _.findLastIndex(top.replies, ownedByUser);
                if (replyIdx !== -1) {
                    const reply = top.replies[replyIdx];
                    res.push(reply);
                }
                // sort by time
                res.sort((a, b) => moment(a.time).isBefore(moment(b.time)));
                // scroll to it
                this.setState({scrollToMessage: res[0].id});
                // set newest to edit
                editSelectedMessage(res[0]);
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
        if (!shouldScroll || scrollToMessage === undefined ||
            !this.state.allMessages || !this.state.allMessages.length) {
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

    markUnread() {
        if (!this._userActive || !this.state.allMessages) {
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
        if (!this.state.currentChannel || !this.state.currentChannel.id) {
            return <span />;
        }

        return (
            <div ref={c => { this.chatContainer = c; }} className={styles.section}>
                {this.state.chatStatus === 'loading' ||
                    !this.state.allMessages && 'Loading...'}

                {this.state.chatStatus !== 'loading' &&
                    this.state.allMessages &&
                    this.state.allMessages.length === 0 && 'No messages yet!'}

                {this.state.allMessages && this.state.allMessages.map(m => (
                    <Message key={m.id} team={this.state.currentTeam.id} {...m} />
                ))}
            </div>
        );
    }
}
