import React from 'react';
import styles from './newchannel.css';
import store$, {createChannel} from '../../store';

export default class NewChannel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentTeam: {},
            parentChannel: 'none',
            channels: [],
        };
    }

    componentWillMount() {
        this.subs = [
            store$
            .map(s => s.filter((_, key) => ['newChannel', 'currentTeam', 'channels'].includes(key)))
            .distinctUntilChanged()
            .map(s => s.toJS())
            .do(s => s.newChannel && this.close(null, true))
            .subscribe(s => this.setState(s)),
        ];
    }
    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    }

    create() {
        const name = this.nameInput.value;
        const description = this.descInput.value;
        const team = this.state.currentTeam.id;
        const parent = this.state.parentChannel;
        createChannel({name, description, team, parent});
    }
    close(e, refetch = false) {
        this.props.close(refetch);
    }

    parentChange(e) {
        this.setState({parentChannel: e.target.value});
    }

    render() {
        return (
            <div className="card is-fullwidth">
                <header className="card-header">
                    <p className="card-header-title">
                        Create new channel
                    </p>
                </header>
                <div className="card-content">
                    <div className="content">
                        <p className="control">
                            <input
                                className="input is-medium"
                                type="text"
                                placeholder="Enter new channel name.."
                                ref={t => { this.nameInput = t; }}
                            />
                        </p>
                        <p className="control">
                            <textarea
                                className="textarea"
                                placeholder="Enter new channel description.."
                                ref={t => { this.descInput = t; }}
                            />
                        </p>
                        <p className={`control is-grouped ${styles.parentChannel}`}>
                            <label className="label">Parent channel:</label>
                            <span className="select">
                                <select onChange={e => this.parentChange(e)} value={this.state.parentChannel}>
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
                    <a className="card-footer-item" onClick={() => this.create()}>Create</a>
                    <a className="card-footer-item" onClick={e => this.close(e)}>Cancel</a>
                </footer>
            </div>
        );
    }
}
