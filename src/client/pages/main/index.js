import React from 'react';
import styles from './main.css';

import Teambar from '../../components/teambar';
import Sidebar from '../../components/sidebar';

const Main = React.createClass({
    render() {
        return (
            <div className={`columns ${styles.columns}`}>
                <Teambar />
                <Sidebar />
                Main thing
            </div>
        );
    },
});

export default Main;
