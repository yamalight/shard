import React from 'react';
import styles from './jointeam.css';
import store$, {joinTeam} from '../../store';

export default class JoinTeam extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            publicTeams: [],
            filterText: '',
            error: undefined,
        };
    }

    componentWillMount() {
        this.subs = [
            store$
            .map(s => s.filter((_, key) => ['publicTeams', 'joinedTeam'].includes(key)))
            .distinctUntilChanged(d => d, (a, b) => a.equals(b))
            .map(s => s.toJS())
            .do(s => s.joinedTeam && this.close(s.joinedTeam))
            .subscribe(s => this.setState(s)),
        ];
    }
    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    }

    handleSearch(e) {
        this.setState({filterText: e.target.value.toLowerCase()});
    }

    join(t) {
        joinTeam({team: t.id});
    }

    close(refetch) {
        store$.clear({joinedTeam: undefined});
        this.props.close(refetch);
    }

    renderTeam(t) {
        return (
            <div className={`card is-fullwidth ${styles.team}`} key={t.id} onClick={() => this.join(t)}>
                <header className="card-header">
                    <div className={`card-header-title ${styles.teamHeader}`}>
                        <span className="icon is-small">
                            <i className="fa fa-users" />
                        </span>
                        <p className="is-flex">{t.name}</p>
                    </div>
                </header>
            </div>
        );
    }

    render() {
        return (
            <div className="card is-fullwidth">
                <header className="card-header">
                    <p className="card-header-title">
                        Join a team
                    </p>
                </header>
                <div className="card-content">
                    <p className="control">
                        <input
                            className={`input is-medium ${this.state.error && 'is-danger'}`}
                            type="text"
                            placeholder="Search teams"
                            onChange={e => this.handleSearch(e)}
                        />
                    </p>
                    <div className="content">
                        {this.state.publicTeams.length === 0 && (
                            <div className="card is-fullwidth">
                                <div className="card-header">
                                    <div className="card-header-title">
                                        No unjoined teams found!
                                    </div>
                                </div>
                            </div>
                        )}
                        {this.state.publicTeams
                            .filter(t => t.name.toLowerCase().includes(this.state.filterText))
                            .map(t => this.renderTeam(t))}
                    </div>
                </div>
            </div>
        );
    }
}
