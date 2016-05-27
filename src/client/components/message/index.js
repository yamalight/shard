import React from 'react';
import moment from 'moment';
import {browserHistory} from 'react-router';
import {hash} from 'spark-md5';
import {markdown} from '../../util';
import styles from './message.css';

// components
import UserInfo from '../user';

// actions
import {replyTo, setInfobar} from '../../store';

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

const Message = (m) => (m.layout === 'short' ? (
    <article id={`message-${m.id}`} className={`media ${styles.short} ${m.isNew ? 'is-new' : ''}`}>
        <p
            className={styles.markdown}
            onClick={markdownClick}
            dangerouslySetInnerHTML={{__html: markdown(m.message)}}
        />
    </article>
) : (
    <article id={`message-${m.id}`} className="media">
        <figure className="media-left">
            <p className="image is-64x64">
                <img src={`http://www.gravatar.com/avatar/${hash(m.user.email)}`} alt="avatar" />
            </p>
        </figure>
        <div className="media-content">
            <div className={`content ${styles.content} ${m.isNew ? 'is-new' : ''}`}>
                <div className={styles.header}>
                    <strong>{m.user.username} <small>{formatTime(m.time)}</small></strong>
                    <span className={styles.headerSeparator} />
                    {m.layout !== 'plain' && (
                        <div className="navbar-left">
                            <a className="navbar-item" onClick={() => replyTo(m)}>
                                <span className="icon is-small">
                                    <i className="fa fa-reply"></i>
                                </span>
                            </a>
                            <a className="navbar-item">
                                <span className="icon is-small"><i className="fa fa-heart"></i></span>
                            </a>
                        </div>
                    )}
                </div>
                <p
                    className={styles.markdown}
                    onClick={markdownClick}
                    dangerouslySetInnerHTML={{__html: markdown(m.message)}}
                />
            </div>
            {m.layout !== 'plain' && m.moreMessages && m.moreMessages.map(mm => (
                <Message layout="short" key={mm.id} {...mm} />
            ))}
            {m.layout !== 'plain' && m.replies && m.replies.map(reply => (
                <Message key={reply.id} {...reply} />
            ))}
        </div>
    </article>
));

export default Message;
