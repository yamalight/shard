import React from 'react';
import styles from './chat.css';

import Description from '../description';
import Message from '../message/';
import MessageShort from '../message-short';

import {sendMessage} from '../../store';

const desc = `This is some __markdown__ description of our awesome chat theme here.

Tasks for nearest future:
- [x] I even
- [ ] can use
- [ ] some lists

## Misc things to remember

This is just a channel description that has some useful things.
There can be [links](http://google.com) [here](http://duckduckgo.com). Or whatever.

![alt text](https://github.com/adam-p/markdown-here/raw/master/src/common/images/icon48.png "Logo Title Text 1")
Even images.
`;

const Chat = React.createClass({
    sendMessage() {
        const message = this._text.value;
        sendMessage({user: 'test', message});
    },

    render() {
        return (
            <div className={`column is-flex ${styles.mainarea}`}>
                <nav className={`navbar ${styles.navbar}`}>
                    <div className="navbar-item">
                        <p className={`title channel-name ${styles.title}`}>
                            Channel 1
                        </p>
                    </div>
                </nav>

                <div ref="chatContainer" className={styles.section}>
                    <Description text={desc} />
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
                            ref={(t) => {this._text = t;}}
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
