import React from 'react';
import moment from 'moment';
import Textarea from 'react-textarea-autosize';
import {browserHistory} from 'react-router';
import {hash} from 'spark-md5';
import {markdown} from '../../util';
import styles from './message.css';

// components
import UserInfo from '../user';
import Dropdown from '../dropdown';

// actions
import {replyTo, setInfobar, updateMessage} from '../../store';

// click handler
const markdownClick = (e) => {
    e.preventDefault();
    if (!e.target.href) {
        return;
    }

    const link = new URL(e.target.href);
    const path = link.pathname;
    if (path.includes('/users/')) {
        const username = path.replace('/users/', '');
        setInfobar({
            title: `Profile: ${username}`,
            content: <UserInfo username={username} />,
        });
        return;
    }
    browserHistory.push(path);
};

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

        this.state = {
            ...this.props,
            showMenu: false,
            authedUser,
        };

        this.menuItems = [{
            title: 'Edit message',
            action: () => this.beginEdit(),
        }];
    }

    componentWillReceiveProps(nextProps) {
        this.setState(nextProps);
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
                {m.user.id === m.authedUser.id && (
                    <a
                        className={`button is-small hint--left ${styles.menuButton}`}
                        data-hint="Show message menu"
                        onClick={(e) => this.openDropdown(e)}
                    >
                        <span className={`icon is-small ${styles.menuIcon}`}>
                            <i className="fa fa-ellipsis-h" />
                        </span>
                    </a>
                )}
                {m.showDropdown && (
                    <Dropdown
                        style={m.menuStyle}
                        title="Message"
                        items={this.menuItems}
                        onItem={it => this.handleMenuItem(it, m)}
                        onHide={() => this.closeDropdown()}
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
        e.preventDefault();
        this.setState({showMenu: false, showDropdown: false});
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
    }
    saveEdit() {
        const newMessage = this._text.value;
        const m = {
            ...this.state,
            message: newMessage,
        };
        updateMessage(m);
        this.setState({editing: false});
    }

    renderContent() {
        const m = this.state;

        if (m.editing) {
            return (
                <div>
                    <Textarea
                        className="textarea"
                        defaultValue={m.message}
                        placeholder="Write a message..."
                        ref={(t) => { this._text = t; }}
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
                onClick={markdownClick}
                dangerouslySetInnerHTML={{__html: markdown(m.message)}}
            />
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
                </article>
            );
        }

        return (
            <article id={`message-${m.id}`} className="media">
                <figure className="media-left">
                    <p className="image is-64x64">
                        <img src={`http://www.gravatar.com/avatar/${hash(m.user.email)}`} alt="avatar" />
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
                            <span className="is-spacer" />
                            {this.createMenu(m)}
                        </div>

                        {this.renderContent()}
                    </div>
                    {m.layout !== 'plain' && m.moreMessages && m.moreMessages.map(mm => (
                        <Message layout="short" key={mm.id} {...mm} />
                    ))}
                    {m.layout !== 'plain' && m.replies && m.replies.map(reply => (
                        <Message key={reply.id} {...reply} />
                    ))}
                </div>
            </article>
        );
    }
}
