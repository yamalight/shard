import React from 'react';
import styles from './chatInput.css';
import Textarea from 'react-textarea-autosize';

// components
import Message from '../message';
import Typeahead from '../typeahead';

// store and actions
import store$, {sendChat, resetReply} from '../../store';

const messageToReplyId = message => {
    if (!message) {
        return undefined;
    }

    if (message.replyTo) {
        return message.replyTo;
    }

    return message.id;
};

export default class ChatInput extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            replyToMessage: null,
            currentTeam: null,
            currentChannel: null,
            text: '',
        };
    }

    componentWillMount() {
        this.subs = [
            store$
            .map(s => s.filter((_, key) => ['replyToMessage', 'currentTeam', 'currentChannel'].includes(key)))
            .distinctUntilChanged(d => d, (a, b) => a.equals(b))
            .map(s => s.toJS())
            .do(s => s.replyToMessage && this._text.focus())
            .subscribe(s => this.setState(s)),
        ];
    }
    componentDidMount() {
        this._text.focus();
    }
    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    }

    sendMessage() {
        const message = this._text.value;

        // do not send empty messages
        if (!message || !message.length) {
            return;
        }

        const team = this.props.currentTeam.id;
        const channel = this.props.currentChannel.id;
        const replyTo = messageToReplyId(this.state.replyToMessage);
        // send
        sendChat({team, channel, message, replyTo});
        // reset value
        this._text.value = '';
    }

    handleKeyUp(e) {
        this.setState({text: e.target.value});
    }

    handleKeyPress(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    render() {
        return (
            <div className={styles.chatInput}>
                {this.state.replyToMessage && (
                    <div className="is-flex">
                        <div className={`is-flex ${styles.replyButton}`}>
                            <i className="fa fa-reply" />
                        </div>
                        <div className={styles.replyPreview}>
                            <Message layout="plain" {...this.state.replyToMessage} hideActions />
                        </div>
                        <a
                            className={`is-flex hint--left ${styles.replyButton}`}
                            data-hint="Cancel reply"
                            onClick={() => resetReply()}
                        >
                            <i className="fa fa-times" />
                        </a>
                    </div>
                )}

                <div className="panel">
                    <Typeahead {...this.state} input={this._text} />

                    <p className={`control has-addons ${styles.stretchControl}`}>
                        <a className={`button ${styles.clipButton}`}>
                            <i className="fa fa-paperclip" />
                        </a>
                        <Textarea
                            className={`textarea ${styles.inputArea}`}
                            placeholder="Write a message..."
                            ref={(t) => { this._text = t; }}
                            onKeyPress={e => this.handleKeyPress(e)}
                            onKeyUp={e => this.handleKeyUp(e)}
                        />
                        <a className={`button ${styles.sendButton}`} onClick={() => this.sendMessage()}>
                            <i className="fa fa-paper-plane" />
                        </a>
                    </p>
                </div>
            </div>
        );
    }
}
