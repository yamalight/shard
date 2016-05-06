import React from 'react';
// import styles from './chatInput.css';

import {sendChat} from '../../store';

const ChatInput = React.createClass({
    sendMessage() {
        const message = this._text.value;
        const team = this.props.currentTeam.id;
        const channel = this.props.currentChannel.id;
        // send
        sendChat({team, channel, message});
        // reset value
        this._text.value = '';
    },

    handleKeyPress(e) {
        if (e.key === 'Enter') {
            this.sendMessage();
        }
    },

    render() {
        return (
            <div>
                <p className="control has-addons">
                    <a className="button">
                        <i className="fa fa-paperclip" />
                    </a>
                    <input
                        className="input"
                        type="text"
                        placeholder="Write a message..."
                        ref={(t) => { this._text = t; }}
                        onKeyPress={this.handleKeyPress}
                    />
                    <a className="button" onClick={this.sendMessage}>
                        <i className="fa fa-paper-plane" />
                    </a>
                </p>
            </div>
        );
    },
});

export default ChatInput;
