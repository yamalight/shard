import React from 'react';
import store$, {createTeam} from '../../store';

const NewTeam = React.createClass({
    componentWillMount() {
        this.subs = [
            store$
            .map(s => s.filter((_, key) => ['newTeam'].includes(key)))
            .map(s => s.toJS())
            .do(s => s.newTeam && this.close(true))
            .subscribe(s => this.setState(s)),
        ];
    },
    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    },

    create() {
        const name = this.input.value;
        createTeam({name});
    },
    close(refetch = false) {
        this.props.close(refetch);
    },

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
                        <p className="control">
                            <input
                                className="input is-medium"
                                type="text"
                                placeholder="Enter new team name.."
                                ref={t => { this.input = t; }}
                            />
                        </p>
                    </div>
                </div>
                <footer className="card-footer">
                    <a className="card-footer-item" onClick={this.create}>Create</a>
                    <a className="card-footer-item" onClick={this.close}>Cancel</a>
                </footer>
            </div>
        );
    },
});

export default NewTeam;
