import React from 'react';
import {markdown} from '../../util';
import styles from './message.css';

const MessagePlain = (m) => (
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
                </div>
                <p dangerouslySetInnerHTML={{__html: markdown(m.message)}} />
            </div>
        </div>
    </article>
);

export default MessagePlain;
