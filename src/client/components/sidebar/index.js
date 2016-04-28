import React from 'react';
import store$ from '../../store';
import styles from './sidebar.css';

const Sidebar = React.createClass({
    getInitialState() {
        return {
            currentTeam: {},
        };
    },

    componentWillMount() {
        this.subs = [
            store$
            .map(s => s.filter((_, key) => ['currentTeam'].includes(key)))
            .map(s => s.toJS())
            .subscribe(s => this.setState(s)),
        ];
    },
    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    },

    render() {
        return (
            <aside className={styles.sidebar}>
                <div className={styles.header}>
                    <header>
                        {this.state.currentTeam.name || 'No team selected'}
                    </header>
                </div>

                <div className={`menu dark-menu ${styles.channels}`}>
                    <p className="menu-label">
                        <a href="#" className={styles.channelsHeader}>
                            Channels
                            <span className={styles.separator} />
                            <span className="icon is-small">
                                <i className="fa fa-plus" />
                            </span>
                        </a>
                    </p>
                    <ul className="menu-list">
                        <li>
                            <a href="#" className="is-active channel-name">Channel 1</a>
                            <ul>
                                <li>
                                    <a href="#" className="channel-name">Subchannel 1</a>
                                </li>
                                <li>
                                    <a href="#" className="channel-name">Subchannel with a super really long name</a>
                                </li>
                                <li>
                                    <a href="#" className="channel-name">Subchannel 3</a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </aside>
        );
    },
});

export default Sidebar;
