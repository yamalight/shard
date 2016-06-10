import React from 'react';
import styles from './notifysettings.css';
import store$, {getNotifySettings, updateNotifySettings} from '../../store';

export const nameRegex = /^[a-z0-9\s-]+$/i;

export default class NotifySettings extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentChannel: {},
            notifySettings: {},
            error: undefined,
        };
    }

    componentWillMount() {
        this.subs = [
            store$
            .map(s => s.filter((v, key) => [
                'currentChannel',
                'notifySettings',
                'updatedSettings',
            ].includes(key)))
            .distinctUntilChanged(d => d, (a, b) => a.equals(b))
            .map(s => s.toJS())
            .do(s => {
                // request settings if new channel
                if (s.currentChannel.id !== this.state.currentChannel.id) {
                    getNotifySettings({channel: s.currentChannel.id});
                }
            })
            .do(s => s.updatedSettings && this.close())
            .subscribe(s => this.setState(s)),
        ];
    }
    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    }

    setNotify(e) {
        this.setState({notifySettings: {notifications: e.target.value}});
    }

    save() {
        const channel = this.state.currentChannel.id;
        const notifications = this.state.notifySettings.notifications;
        updateNotifySettings({channel, notifications});
    }

    close(ch) {
        store$.clear({updatedSettings: undefined});
        this.props.close(ch);
    }

    render() {
        return (
            <div className="card is-fullwidth">
                <header className="card-header">
                    <p className="card-header-title">
                        Notification settings
                    </p>
                </header>
                <div className="card-content">
                    <div className="content">
                        <p className={`control is-grouped ${styles.parentChannel}`}>
                            <label className="label">Notify on:</label>
                            <span className="select">
                                <select
                                    onChange={e => this.setNotify(e)}
                                    value={this.state.notifySettings.notifications}
                                >
                                    <option value="all">All messages</option>
                                    <option value="mentions">Mentions only</option>
                                    <option value="none">Do not notify</option>
                                </select>
                            </span>
                        </p>
                    </div>
                </div>
                <footer className="card-footer">
                    <a className="card-footer-item" onClick={() => this.save()}>Save</a>
                    <a className="card-footer-item" onClick={() => this.close()}>Cancel</a>
                </footer>
            </div>
        );
    }
}
