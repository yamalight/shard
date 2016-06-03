import React from 'react';
import styles from './editteam.css';
import {nameRegex} from '../newchannel';
import store$, {updateTeam} from '../../store';

export default class EditTeam extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    componentWillMount() {
        this.subs = [
            store$
            .map(s => s.filter((_, key) => [
                'currentTeam',
                'updatedTeam',
                'teamError',
            ].includes(key)))
            .distinctUntilChanged(d => d, (a, b) => a.equals(b))
            .map(s => s.toJS())
            .do(s => s.updatedTeam && this.close(s.updatedTeam))
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

    update() {
        const id = this.state.currentTeam.id;
        const name = this._input.value;
        const isPrivate = this._private.checked;
        const description = this.descInput.value;

        // do not create empty name teams
        if (!name || !name.length) {
            return;
        }

        // check that team name is alpha-numeric only
        if (!nameRegex.test(name)) {
            this.setState({error: 'Channel name must be alpha-numberic with spaces and dashes!'});
            return;
        }

        updateTeam({id, name, description, isPrivate});
    }
    close(updatedTeam) {
        store$.clear({teamError: undefined, updatedTeam: undefined});
        this.props.close(updatedTeam);
    }

    validateName(e) {
        // check that team name is alpha-numeric only
        if (e.target.value && !nameRegex.test(e.target.value)) {
            this.setState({error: 'Channel name must be alpha-numberic with spaces and dashes!'});
            return;
        }

        this.setState({error: undefined});
    }

    resetError() {
        store$.clear({teamError: undefined});
    }

    render() {
        return (
            <div className="card is-fullwidth">
                <header className="card-header">
                    <p className="card-header-title">
                        Edit team
                    </p>
                </header>
                <div className="card-content">
                    <div className="content">
                        {this.state.teamError && (
                            <div className="notification is-danger">
                                <button className="delete" onClick={() => this.resetError()} />
                                {this.state.teamError}
                            </div>
                        )}
                        <p className={`control ${this.state.error && 'has-icon has-icon-right'}`}>
                            <input
                                className={`input is-medium ${this.state.error && 'is-danger'}`}
                                type="text"
                                placeholder="Enter team name.."
                                defaultValue={this.state.currentTeam.name}
                                ref={t => { this._input = t; }}
                                onKeyPress={e => this.handleKey(e)}
                                onKeyUp={e => this.validateName(e)}
                            />
                            {this.state.error && <i className="fa fa-warning" />}
                            {this.state.error && <span className="help is-danger">{this.state.error}</span>}
                        </p>
                        <p className="control">
                            <textarea
                                className="textarea"
                                placeholder="Enter team description.."
                                defaultValue={this.state.currentTeam.description}
                                ref={t => { this.descInput = t; }}
                            />
                        </p>
                        <p className="control">
                            <label className="checkbox">
                                <input
                                    className={styles.check}
                                    type="checkbox"
                                    ref={p => { this._private = p; }}
                                    defaultChecked={this.state.currentTeam.isPrivate}
                                />
                                Private team
                            </label>
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
