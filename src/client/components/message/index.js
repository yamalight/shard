import React from 'react';
import {browserHistory} from 'react-router';
import {markdown} from '../../util';
import styles from './message.css';

import {replyTo, setInfobar} from '../../store';

import UserInfo from '../user';

export const markdownClick = (e) => {
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

const Message = (m) => (m.layout === 'short' ? (
    <article className={`media ${styles.short}`}>
        <p onClick={markdownClick} dangerouslySetInnerHTML={{__html: markdown(m.message)}} />
    </article>
) : (
    <article className="media">
        <figure className="media-left">
            <p className="image is-64x64">
                <img src="http://placehold.it/128x128" alt="avatar" />
            </p>
        </figure>
        <div className="media-content">
            <div className={`content ${styles.content}`}>
                <div className={styles.header}>
                    <strong>{m.user.username} <small>{m.time}</small></strong>
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
