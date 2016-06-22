import _ from 'lodash';
import {Subject} from 'rx';
import React from 'react';
import styles from './chatInput.css';
import Textarea from 'react-textarea-autosize';

// components
import Message from '../message';
import Typeahead from '../typeahead';
import {handleCommandPaletteEvent} from '../commandpalette';

// store and actions
import store$, {sendChat, resetReply, resetForward, editLastMessage} from '../../store';

// get send extensions
import {extensions} from '../../extensions';
const sendExtensions = extensions.filter(ex => ex.type === 'clientSend');

// convert message to reply id
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

        this.typeaheadAction = new Subject();

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
            .map(s => s.filter((v, key) => [
                'replyToMessage',
                'forwardMessage',
                'currentTeam',
                'currentChannel',
            ].includes(key)))
            .distinctUntilChanged(d => d, (a, b) => a.equals(b))
            .map(s => s.toJS())
            .do(() => this._text && this._text.focus())
            .subscribe(s => this.setState(s)),

            // listen for focus requests
            store$
            .map(s => s.get('focusInput'))
            .distinctUntilChanged()
            .subscribe(() => this.focusInput()),
        ];
    }
    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    }

    focusInput() {
        if (this._text) {
            this._text.focus();
        }
    }

    sendMessage() {
        const forwardMessage = this.state.forwardMessage ?
            `%%% widget=/api/message/${this.state.forwardMessage.id}/embed` :
            '';
        const message = `${this._text.value}\n${forwardMessage}`;

        // do not send empty messages
        if (!message || !message.length) {
            return;
        }

        const team = this.state.currentTeam.id;
        const channel = this.state.currentChannel.id;
        const replyTo = messageToReplyId(this.state.replyToMessage);
        const data = {team, channel, message, replyTo};

        // process with send intercepting extensions
        const dataToSend = sendExtensions.reduce((sum, el) => el.handleMessage(sum), data);

        // send if returned data is truthy
        if (dataToSend) {
            sendChat(dataToSend);
        }
        // reset value
        this._text.value = '';
    }

    handleKeyUp(e) {
        this.setState({text: e.target.value});
    }

    handleKeyDown(e) {
        // catch command palette event
        if (handleCommandPaletteEvent(e)) {
            return;
        }

        // handle up-down-enter during typeahead
        if (this._typeahead.state.shouldAppear) {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter') {
                e.preventDefault();
                this.typeaheadAction.onNext(e.key);
            }
            return;
        }

        // handle up during typing
        if (e.key === 'ArrowUp' && !e.target.value.includes('\n')) {
            e.preventDefault();
            editLastMessage();
        }
    }

    handleKeyPress(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    resetReferenceMessage() {
        if (this.state.replyToMessage) {
            resetReply();
        }

        if (this.state.forwardMessage) {
            resetForward();
        }
    }

    // renders reference message - reply or forward message
    renderReferenceMessage() {
        if (!this.state.replyToMessage && !this.state.forwardMessage) {
            return null;
        }

        let message = this.state.replyToMessage;
        let kind = 'reply';
        let icon = 'reply';
        if (!message) {
            message = this.state.forwardMessage;
            kind = 'forward';
            icon = 'arrow-right';
        }

        return (
            <div className="is-flex">
                <div className={`is-flex ${styles.replyButton}`}>
                    <i className={`fa fa-${icon}`} />
                </div>
                <div className={styles.replyPreview}>
                    <Message
                        layout="plain"
                        hideActions
                        {..._.omit(message, ['layout', 'showMenu'])}
                    />
                </div>
                <a
                    className={`force-flex hint--left ${styles.replyButton}`}
                    data-hint={`Cancel ${kind}`}
                    onClick={() => this.resetReferenceMessage()}
                >
                    <i className="fa fa-times" />
                </a>
            </div>
        );
    }

    render() {
        if (!this.state.currentChannel || !this.state.currentChannel.id) {
            return <span />;
        }

        // TODO: removing top div messes up autosuggest sizing, why? D:
        return (
            <div>
                <div className={styles.chatInput}>
                    {this.renderReferenceMessage()}

                    <div className="panel">
                        <Typeahead
                            {...this.state}
                            ref={t => { this._typeahead = t; }}
                            action={this.typeaheadAction}
                            input={this._text}
                        />

                        <p className={`control has-addons ${styles.stretchControl}`}>
                            {/* TODO: uncomment me when implemented
                            <a className={`button ${styles.clipButton}`}>
                                <i className="fa fa-paperclip" />
                            </a> */}
                            <Textarea
                                className={`textarea ${styles.inputArea}`}
                                placeholder="Write a message..."
                                ref={(t) => { this._text = t; }}
                                onKeyPress={e => this.handleKeyPress(e)}
                                onKeyUp={e => this.handleKeyUp(e)}
                                onKeyDown={e => this.handleKeyDown(e)}
                            />
                            <a className={`button ${styles.sendButton}`} onClick={() => this.sendMessage()}>
                                <i className="fa fa-paper-plane" />
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}
