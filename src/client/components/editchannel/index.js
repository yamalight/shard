import React from 'react';
import styles from './editchannel.css';
import store$, {updateChannel} from '../../store';

export const nameRegex = /^[a-z0-9\s-]+$/i;

export default class EditChannel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentChannel: {},
            currentTeam: {},
            parentChannel: 'none',
            channels: [],
            error: undefined,
        };
    }

    componentWillMount() {
        this.subs = [
            store$
            .map(s => s.filter((v, key) => [
                'currentChannel',
                'channelError',
                'updatedChannel',
                'currentTeam',
                'channels',
            ].includes(key)))
            .distinctUntilChanged(d => d, (a, b) => a.equals(b))
            .map(s => s.toJS())
            .do(s => {
                if (s.updatedChannel) {
                    this.close(true);
                }
            })
            .subscribe(s => this.setState(s)),
        ];
    }
    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    }

    handleKey(e) {
        if (e.key === 'Enter') {
            this.update();
        }
    }

    validateName(e) {
        // check that team name is alpha-numeric only
        if (e.target.value && !nameRegex.test(e.target.value)) {
            this.setState({error: 'Channel name must be alpha-numberic with spaces and dashes!'});
            return;
        }

        this.setState({error: undefined});
    }

    update() {
        const name = this.nameInput.value;

        // do not create empty name channels
        if (!name || !name.length) {
            return;
        }

        // check that team name is alpha-numeric only
        if (!nameRegex.test(name)) {
            this.setState({error: 'Channel name must be alpha-numberic with spaces and dashes!'});
            return;
        }

        const id = this.state.currentChannel.id;
        const description = this.descInput.value;
        const team = this.state.currentTeam.id;
        const parent = this.state.parentChannel;
        updateChannel({id, name, description, team, parent});
    }
    close(refetch = false) {
        this.resetError();
        store$.clear({updatedChannel: undefined});
        this.props.close(refetch);
    }

    parentChange(e) {
        this.setState({parentChannel: e.target.value});
    }

    resetError() {
        store$.clear({channelError: undefined});
    }

    render() {
        return (
            <div className="card is-fullwidth">
                <header className="card-header">
                    <p className="card-header-title">
                        Edit channel
                    </p>
                </header>
                <div className="card-content">
                    <div className="content">
                        {this.state.channelError && (
                            <div className="notification is-danger">
                                <button className="delete" onClick={() => this.resetError()} />
                                {this.state.channelError}
                            </div>
                        )}
                        <p className={`control ${this.state.error && 'has-icon has-icon-right'}`}>
                            <input
                                className={`input is-medium ${this.state.error && 'is-danger'}`}
                                type="text"
                                placeholder="Enter new channel name.."
                                ref={t => { this.nameInput = t; }}
                                onKeyPress={e => this.handleKey(e)}
                                onKeyUp={e => this.validateName(e)}
                                defaultValue={this.state.currentChannel.name}
                            />
                            {this.state.error && <i className="fa fa-warning" />}
                            {this.state.error && <span className="help is-danger">{this.state.error}</span>}
                        </p>
                        <p className="control">
                            <textarea
                                className="textarea"
                                placeholder="Enter new channel description.."
                                ref={t => { this.descInput = t; }}
                                defaultValue={this.state.currentChannel.description}
                            />
                        </p>
                        <p className={`control is-grouped ${styles.parentChannel}`}>
                            <label className="label">Parent channel:</label>
                            <span className="select">
                                <select
                                    onChange={e => this.parentChange(e)}
                                    value={this.state.parentChannel}
                                    defaultValue={this.state.currentChannel.parent}
                                >
                                    <option value="none">None</option>
                                    {this.state.channels && this.state.channels.map(channel => (
                                        <option key={channel.id} value={channel.id}>
                                            {channel.name}
                                        </option>
                                    ))}
                                </select>
                            </span>
                        </p>
                    </div>
                </div>
                <footer className="card-footer">
                    <a className="card-footer-item" onClick={() => this.update()}>Update</a>
                    <a className="card-footer-item" onClick={() => this.close()}>Cancel</a>
                </footer>
            </div>
        );
    }
}
