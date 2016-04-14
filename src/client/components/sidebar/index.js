import React from 'react';
import styles from './sidebar.css';

const Sidebar = React.createClass({
    getInitialState() {
        return {};
    },

    render() {
        return (
            <aside className={styles.sidebar}>
                <div className={styles.header}>
                    <header>
                        Team name
                    </header>
                </div>

                <div className={`menu dark-menu ${styles.channels}`}>
                    <p className="menu-label">
                        Channels
                    </p>
                    <ul className="menu-list">
                        <li>
                            <a href="#" className="is-active">Channel 1</a>
                            <ul>
                                <li><a href="#">Subchannel 1</a></li>
                                <li><a href="#">Subchannel with a super really long name</a></li>
                                <li><a href="#">Subchannel 3</a></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </aside>
        );
    },
});

export default Sidebar;
