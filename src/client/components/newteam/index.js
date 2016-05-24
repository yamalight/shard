import React from 'react';
import store$, {createTeam} from '../../store';

export default class NewTeam extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    componentWillMount() {
        this.subs = [
            store$
            .map(s => s.get('newTeam'))
            .filter(team => team !== undefined)
            .distinctUntilChanged()
            .map(team => team.toJS())
            .do(team => team && this.close(null, true))
            .subscribe(newTeam => this.setState({newTeam})),
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

        createTeam({name});
    }
    close(e, refetch = false) {
        this.props.close(refetch);
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
                        <p className="control">
                            <input
                                className="input is-medium"
                                type="text"
                                placeholder="Enter new team name.."
                                ref={t => { this.input = t; }}
                                onKeyPress={e => this.handleKey(e)}
                            />
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
