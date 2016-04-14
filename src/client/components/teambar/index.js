import React from 'react';
import styles from './teambar.css';

const Teambar = React.createClass({
    getInitialState() {
        return {};
    },

    render() {
        return (
            <div className={`${styles.teambar}`}>
                <span className="icon is-large">
                    <i className="fa fa-users"></i>
                </span>
            </div>
        );
    },
});

export default Teambar;
