import React from 'react';
import marked from './marked';
import styles from './description.css';

const Description = ({text}) => (
    <div className={`column content ${styles.content}`}>
        <div
            className={styles.description}
            dangerouslySetInnerHTML={{__html: marked(text)}}
        />
    </div>
);

export default Description;
