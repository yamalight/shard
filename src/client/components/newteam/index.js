import React from 'react';
import {nameRegex} from '../newchannel';
import store$, {createTeam} from '../../store';

export default class NewTeam extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    componentWillMount() {
        this.subs = [
            store$
            .map(s => s.filter((_, key) => ['newTeam', 'teamError'].includes(key)))
            .distinctUntilChanged()
            .map(s => s.toJS())
            .do(s => s.newTeam && this.close(null, true))
            .subscribe(s => this.setState(s)),
        ];
    }
    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    }

    handleKey(e) {
        if (e.key === 'Enter') {
            this.create();
        }
    }

    create() {
        const name = this.input.value;

        // do not create empty name teams
        if (!name || !name.length) {
            return;
        }

        // check that team name is alpha-numeric only
        if (!nameRegex.test(name)) {
            this.setState({error: 'Channel name must be alpha-numberic with spaces and dashes!'});
            return;
        }

        createTeam({name});
    }
    close(e, refetch = false) {
        this.resetError();
        this.props.close(refetch);
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
                        Create new team
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
                                placeholder="Enter new team name.."
                                ref={t => { this.input = t; }}
                                onKeyPress={e => this.handleKey(e)}
                                onKeyUp={e => this.validateName(e)}
                            />
                            {this.state.error && <i className="fa fa-warning" />}
                            {this.state.error && <span className="help is-danger">{this.state.error}</span>}
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
