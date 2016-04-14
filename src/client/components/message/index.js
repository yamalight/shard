import React from 'react';
import styles from './message.css';

const Message = ({user, time, message, moreMessages, replies}) => (
    <article className="media">
        <figure className="media-left">
            <p className="image is-64x64">
                <img src="http://placehold.it/128x128" alt="avatar" />
            </p>
        </figure>
        <div className="media-content">
            <div className={`content ${styles.content}`}>
                <div className={styles.header}>
                    <strong>{user} <small>{time}</small></strong>
                    <span className={styles.headerSeparator} />
                    <div className="navbar-left">
                        <a className="navbar-item">
                            <span className="icon is-small"><i className="fa fa-reply"></i></span>
                        </a>
                        <a className="navbar-item">
                            <span className="icon is-small"><i className="fa fa-heart"></i></span>
                        </a>
                    </div>
                </div>
                <p>{message}</p>
            </div>
            {moreMessages}
            {replies}
        </div>
    </article>
);

export default Message;
