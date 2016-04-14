import React from 'react';
import styles from './main.css';

import Sidebar from '../../components/sidebar';

const Main = React.createClass({
    render() {
        return (
            <div className={`columns ${styles.columns}`}>
                <div className={`${styles.teambar}`}>
                    <span className="icon is-large">
                        <i className="fa fa-users"></i>
                    </span>
                </div>
                <div className={`${styles.sidebar}`}>
                    <Sidebar />
                </div>
                Main thing
            </div>
        );
    },
});

export default Main;
