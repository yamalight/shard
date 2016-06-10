import React from 'react';
import styles from './notifications.css';
import {markdown} from '../../util';

// store and actions
import store$, {getNotifications} from '../../store';

export default class Notifications extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            notifications: undefined,
        };

        getNotifications();
    }

    componentWillMount() {
        this.subs = [
            store$
            .map(s => s.filter((v, key) => ['notifications'].includes(key)))
            .distinctUntilChanged(d => d, (a, b) => a.equals(b))
            .map(s => s.toJS())
            .subscribe(s => this.setState(s)),
        ];
    }

    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    }

    action(notification) {
        console.log('action on:', notification);
    }

    render() {
        return (
            <div className={`panel is-fullwidth ${styles.panel}`}>
                <header className="panel-heading">
                    Notifications
                </header>
                {!this.state.notifications && (
                    <a className="panel-block content">
                        Loading notifications...
                    </a>
                )}
                {this.state.notifications && this.state.notifications.length === 0 && (
                    <a className="panel-block content">
                        No notifications found!
                    </a>
                )}
                {this.state.notifications && this.state.notifications.map(n => (
                    <a className="panel-block content" key={n.id} onClick={() => this.action(n)}>
                        <span dangerouslySetInnerHTML={{__html: markdown(n.message)}} />
                    </a>
                ))}
            </div>
        );
    }
}
