import React from 'react';
import {markdown} from '../../util';
import styles from './short.css';

const Message = (m) => (
    <article className={`media ${styles.short}`}>
        <span dangerouslySetInnerHTML={{__html: markdown(m.message)}} />
        {/*<div className="media-right">
            {time}
        </div>*/}
    </article>
);

export default Message;
