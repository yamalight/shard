import React from 'react';
import styles from './main.css';

import Teambar from '../../components/teambar';
import Sidebar from '../../components/sidebar';
import Chat from '../../components/chat';

const Main = React.createClass({
    render() {
        return (
            <div className={`columns ${styles.columns}`}>
                <Teambar />
                <Sidebar />
                <Chat />
            </div>
        );
    },
});

export default Main;
