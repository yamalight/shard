import _ from 'lodash';
import React from 'react';
import moment from 'moment';
import Textarea from 'react-textarea-autosize';
import {hash} from 'spark-md5';
import {markdown} from '../../util';
import styles from './message.css';

// components
import UserInfo from '../user';
import Dropdown from '../dropdown';

// actions
import store$, {
    replyTo,
    forwardMessage,
    setInfobar,
    updateMessage,
    selectMessage,
    setChannel,
    focusInput,
} from '../../store';

// time formatting
const formatTime = (time) => {
    const t = moment(time);

    // if older than 1 day, format as date
    const yesterday = moment().subtract(1, 'day');
    if (t.isBefore(yesterday)) {
        return t.format('llll');
    }

    // otherwise return relative string
    return t.fromNow();
};

export default class Message extends React.Component {
    constructor(props) {
        super(props);

        const authedUser = JSON.parse(localStorage.getItem('user'));

        this.message = this.props;

        this.state = {
            ...this.props,
            showMenu: false,
            showReadBy: false,
            authedUser,
        };

        this.menuItems = [{
            title: 'Read by users',
            action: () => this.showReadBy(),
        }, {
            title: 'Select',
            action: () => this.select(),
        }, {
            title: 'Forward',
            action: () => this.forward(),
        }];

        if (this.state.user.id === this.state.authedUser.id) {
            this.menuItems.push({
                title: 'Edit message',
                action: () => this.beginEdit(),
            });
        }
    }

    componentWillMount() {
        this.subs = [
            // last message edit requests
            store$
            .map(s => s.get('editSelectedMessage'))
            .filter(m => m !== undefined)
            .filter(message => message.get('id') === this.state.id)
            .subscribe(() => {
                this.beginEdit();
                // reset
                store$.clear({editSelectedMessage: undefined});
            }),

            // channels list
            store$
            .map(s => s.filter((v, key) => ['channels'].includes(key)))
            .distinctUntilChanged(d => d, (a, b) => a.equals(b))
            .map(s => s.toJS())
            .subscribe(s => this.setState(s)),
        ];
    }

    componentWillReceiveProps(nextProps) {
        this.setState(nextProps);
    }

    componentDidUpdate() {
        if (this._text) {
            this._text.focus();
        }
    }

    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    }

    // click handler
    markdownClick(e) {
        e.preventDefault();
        if (!e.target.href) {
            return;
        }

        const link = new URL(e.target.href);
        const path = link.pathname;
        // open user info
        if (path.includes('/users/')) {
            const username = path.replace('/users/', '');
            setInfobar({
                title: `Profile: ${username}`,
                content: () => <UserInfo username={username} />,
            });
            return;
        }
        // navigate to given channel
        if (path.includes('/channels/')) {
            const parts = path.split('/');
            const channelName = parts.pop();
            const channel = _.flatten(this.state.channels.concat(this.state.channels.map(c => c.subchannels)))
                .find(ch => _.camelCase(ch.name) === channelName);
            setChannel(channel);
            return;
        }
        // otherwise just open url in new tab
        window.open(link, '_blank');
    }

    createMenu() {
        const m = this.state;

        if (m.hideActions || !m.showMenu) {
            return null;
        }

        return (
            <div className="control has-addons">
                <a
                    className={`button is-small hint--left ${styles.menuButton}`}
                    onClick={() => replyTo(m)}
                    data-hint="Reply"
                >
                    <span className={`icon is-small ${styles.menuIcon}`}>
                        <i className="fa fa-reply" />
                    </span>
                </a>
                <a
                    className={`button is-small hint--left ${styles.menuButton}`}
                    data-hint="Show message menu"
                    onClick={(e) => this.openDropdown(e)}
                >
                    <span className={`icon is-small ${styles.menuIcon}`}>
                        <i className="fa fa-ellipsis-h" />
                    </span>
                </a>
                {m.showDropdown && (
                    <Dropdown
                        style={m.menuStyle}
                        title="Message"
                        items={this.menuItems}
                        onItem={it => this.handleMenuItem(it, m)}
                        onHide={() => this.closeDropdown()}
                    />
                )}
                {m.showReadBy && (
                    <Dropdown
                        style={m.menuStyle}
                        title="Read by users"
                        items={this.state.readBy.map(u => ({title: u.username}))}
                        onItem={() => {}}
                        onHide={() => this.closeReadBy()}
                    />
                )}
            </div>
        );
    }

    showMenu(e) {
        e.preventDefault();
        this.setState({showMenu: true});
    }
    hideMenu(e) {
        if (e) {
            e.preventDefault();
        }
        this.setState({showMenu: false, showDropdown: false, showReadBy: false});
    }

    openDropdown(e) {
        this.setState({showDropdown: true, menuStyle: {top: e.clientY, left: e.clientX, right: 'auto'}});
    }
    closeDropdown() {
        this.setState({showDropdown: false});
    }
    handleMenuItem(it) {
        it.action();
    }

    beginEdit() {
        this.setState({editing: true});
    }
    closeEdit() {
        this.setState({editing: false});
        focusInput();
    }
    saveEdit() {
        const newMessage = this._text.value;
        const m = {
            ...this.state,
            message: newMessage,
        };
        updateMessage(m);
        this.setState({editing: false});
        focusInput();
    }

    handleKeyDown(e) {
        if (e.key === 'Escape') {
            e.preventDefault();
            this.closeEdit();
        }
    }

    handleKeyPress(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.saveEdit();
        }
    }

    showReadBy() {
        this.setState({showReadBy: true});
    }
    closeReadBy() {
        this.setState({showReadBy: false});
    }

    select() {
        selectMessage({
            ...this.message,
            selected: true,
        });
        this.hideMenu();
    }
    forward() {
        forwardMessage(this.message);
        this.hideMenu();
    }

    deselect() {
        selectMessage({
            ...this.message,
            selected: false,
        });
    }

    renderContent() {
        const m = this.state;

        if (m.editing) {
            return (
                <div>
                    <Textarea
                        className={`textarea ${styles.inputArea}`}
                        defaultValue={m.message}
                        placeholder="Write a message..."
                        ref={(t) => { this._text = t; }}
                        minRows={1}
                        maxRows={6}
                        onKeyPress={e => this.handleKeyPress(e)}
                        onKeyDown={e => this.handleKeyDown(e)}
                    />
                    <div className={styles.editButtons}>
                        <button
                            className="button"
                            disabled={m.channelStatus === 'updating'}
                            onClick={() => this.closeEdit()}
                        >
                            Cancel
                        </button>
                        <div className="is-spacer" />
                        <button
                            className={`button is-success ${m.channelStatus === 'updating' ? 'is-loading' : ''}`}
                            disabled={m.channelStatus === 'updating'}
                            onClick={() => this.saveEdit()}
                        >
                            Save
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <p
                className={styles.markdown}
                onClick={e => this.markdownClick(e)}
                onDoubleClick={() => m.user.id === m.authedUser.id && this.beginEdit()}
                dangerouslySetInnerHTML={{__html: markdown(m.message)}}
            />
        );
    }

    renderSelect() {
        const m = this.state;

        if (!m.selected) {
            return null;
        }

        return (
            <span className={`is-flex control ${styles.select}`}>
                <label className="checkbox">
                    <input type="checkbox" checked={m.selected} onChange={() => this.deselect()} />
                </label>
            </span>
        );
    }

    render() {
        const m = this.state;

        if (m.layout === 'short') {
            return (
                <article
                    id={`message-${m.id}`}
                    className={`media ${styles.short} ${m.isNew ? 'is-new' : ''}`}
                    onMouseEnter={(e) => this.showMenu(e)}
                    onMouseLeave={(e) => this.hideMenu(e)}
                >
                    <div className="media-content content">
                        {this.renderContent()}
                    </div>
                    <div className="media-right">
                        {this.createMenu(m)}
                    </div>
                    {this.renderSelect()}
                </article>
            );
        }

        return (
            <article id={`message-${m.id}`} className="media">
                <figure className="media-left">
                    <p className="image is-64x64">
                        <img
                            src={`${window.location.protocol}//www.gravatar.com/avatar/${hash(m.user.email)}`}
                            alt={m.user.username}
                        />
                    </p>
                </figure>
                <div className="media-content">
                    <div
                        className={`content ${styles.content} ${m.isNew ? 'is-new' : ''}`}
                        onMouseEnter={(e) => this.showMenu(e)}
                        onMouseLeave={(e) => this.hideMenu(e)}
                    >
                        <div className={styles.header}>
                            <strong>{m.user.username} <small>{formatTime(m.time)}</small></strong>
                            {this.renderSelect()}
                            <span className="is-spacer" />
                            {this.createMenu(m)}
                        </div>

                        {this.renderContent()}
                    </div>
                    {m.layout !== 'plain' && m.moreMessages && m.moreMessages.map(mm => (
                        <Message
                            key={mm.id}
                            layout="short"
                            {...mm}
                        />
                    ))}
                    {m.layout !== 'plain' && m.replies && m.replies.map(reply => (
                        <Message
                            key={reply.id}
                            {...reply}
                        />
                    ))}
                </div>
            </article>
        );
    }
}
