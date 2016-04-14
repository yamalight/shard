import React from 'react';
import styles from './short.css';

const Message = ({time, message}) => (
    <article className={`media ${styles.short}`}>
        {message}
        {/*<div className="media-right">
            {time}
        </div>*/}
    </article>
);

export default Message;
