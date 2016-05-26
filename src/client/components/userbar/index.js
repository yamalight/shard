import React from 'react';
// import {browserHistory} from 'react-router';
import styles from './userbar.css';

// store and actions
// import store$, {getChannels, setChannel, resetNewChannel} from '../../store';

// util
import {logout} from '../../util';

export default class Userbar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: localStorage.getItem('user'),
        };
    }

    render() {
        return (
            <div className={`is-flex ${styles.userbar}`}>
                <a className="button is-black is-small" onClick={() => logout()}>
                    Logout
                </a>
            </div>
        );
    }
}
