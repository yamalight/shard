import React from 'react';
import {markdown} from '../../util';
import styles from './description.css';

const Description = ({text}) => (
    <div className={`column content ${styles.content}`}>
        <div
            className={styles.description}
            dangerouslySetInnerHTML={{__html: markdown(text)}}
        />
    </div>
);

export default Description;
