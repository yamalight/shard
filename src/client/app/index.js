import React from 'react';
import styles from './app.css';

export default ({children}) => (
    <section className={`hero is-fullheight ${styles.hero}`}>
        <div className={`hero-content ${styles.customHero}`}>
            {children}
        </div>
    </section>
);
