import React from 'react';
import styles from './main.css';

import Teambar from '../../components/teambar';
import Sidebar from '../../components/sidebar';
import Chat from '../../components/chat';

const Main = React.createClass({
    componentDidMount() {
    },

    render() {
        return (
            <div className={styles.app}>
                <Teambar />
                <Sidebar />
                <Chat />
            </div>
        );
    },
});

export default Main;
