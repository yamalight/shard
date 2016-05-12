import React from 'react';
import {markdown} from '../../util';
import styles from './message.css';

import {replyTo} from '../../store';

import MessageShort from '../message-short';

const Message = (m) => (
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
                </div>
                <p dangerouslySetInnerHTML={{__html: markdown(m.message)}} />
            </div>
            {m.moreMessages && m.moreMessages.map(mm => (
                <MessageShort key={mm.id} {...mm} />
            ))}
            {m.replies && m.replies.map(reply => (
                <Message key={reply.id} {...reply} />
            ))}
        </div>
    </article>
);

export default Message;
