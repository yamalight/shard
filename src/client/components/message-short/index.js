import React from 'react';
import {markdown} from '../../util';
import styles from './short.css';

import {markdownClick} from '../message';

const Message = (m) => (
    <article className={`media ${styles.short}`}>
        <p onClick={markdownClick} dangerouslySetInnerHTML={{__html: markdown(m.message)}} />
        {/*<div className="media-right">
            {time}
        </div>*/}
    </article>
);

export default Message;
