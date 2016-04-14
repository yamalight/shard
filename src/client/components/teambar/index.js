import React from 'react';
import styles from './teambar.css';

const Teambar = React.createClass({
    getInitialState() {
        return {};
    },

    render() {
        return (
            <div className={styles.teambar}>
                <a href="#" className={styles.iconButton}>
                    <span className="icon is-large hint--right hint--info" data-hint="Direct messages">
                        <i className="fa fa-users"></i>
                    </span>
                </a>
                <div className={styles.separator} />
                <a href="#" className={`${styles.iconButton} ${styles.iconButtonFaded}`}>
                    <span className="icon is-large hint--right hint--info" data-hint="Create new team">
                        <i className="fa fa-plus-circle"></i>
                    </span>
                </a>
            </div>
        );
    },
});

export default Teambar;
