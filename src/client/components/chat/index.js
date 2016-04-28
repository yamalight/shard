import React from 'react';
import styles from './chat.css';

import Description from '../description';
import Message from '../message/';
import MessageShort from '../message-short';

import store$ from '../../store';

const Chat = React.createClass({
    getInitialState() {
        return {
            currentChannel: {},
        };
    },

    componentWillMount() {
        this.subs = [
            store$
            .map(s => s.filter((_, key) => ['currentChannel'].includes(key)))
            .map(s => s.toJS())
            .subscribe(s => this.setState(s)),
        ];
    },
    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    },

    sendMessage() {
        const message = this._text.value;
        console.log(message);
        // sendMessage({user: 'test', message});
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
                    <Message
                        user="John Smith"
                        username="johnsmith"
                        time="31m"
                        message={`Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Proin ornare magna eros, eu pellentesque tortor vestibulum ut.
                        Maecenas non massa sem. Etiam finibus odio quis feugiat facilisis.`}
                        moreMessages={[
                            <MessageShort
                                key="short"
                                message={`Morbi vitae diam et purus tincidunt porttitor vel vitae augue.
                                Praesent malesuada metus sed pharetra euismod.
                                Cras tellus odio, tincidunt iaculis diam non, porta aliquet tortor.`}
                            />,
                            <MessageShort
                                key="short2"
                                message="Morbi vitae diam et purus tincidunt porttitor vel vitae augue."
                            />,
                        ]}
                        replies={[
                            <Message
                                key="full"
                                user="Test User"
                                username="testuser"
                                time="30m"
                                message="This is a test reply nested in second level"
                                moreMessages={[
                                    <MessageShort
                                        key="short2"
                                        message="Morbi vitae diam et purus tincidunt porttitor vel vitae augue."
                                    />,
                                    <MessageShort
                                        key="short"
                                        message={`Morbi vitae diam et purus tincidunt porttitor vel vitae augue.
                                        Praesent malesuada metus sed pharetra euismod.
                                        Cras tellus odio, tincidunt iaculis diam non, porta aliquet tortor.`}
                                    />,
                                ]}
                                replies={(
                                    <Message
                                        user="Other User"
                                        username="otheruser"
                                        time="29m"
                                        message="This is another test reply nested in second level"
                                        moreMessages={[
                                            <MessageShort
                                                key="short2"
                                                message="Morbi vitae diam et purus tincidunt porttitor vel vitae augue."
                                                time="20m"
                                            />,
                                            <MessageShort
                                                key="short"
                                                message="Praesent malesuada metus sed pharetra euismod."
                                                time="18m"
                                            />,
                                            <MessageShort
                                                key="short3"
                                                message="Cras tellus odio, tincidunt iaculis diam non, porta."
                                                time="10m"
                                            />,
                                        ]}
                                    />
                                )}
                            />,
                        ]}
                    />
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
