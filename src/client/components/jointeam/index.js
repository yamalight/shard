import React from 'react';
import styles from './jointeam.css';
import {markdown} from '../../util';
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

            // status sub
            store$
            .map(s => s.get('teamStatus'))
            .distinctUntilChanged()
            .subscribe(status => this.setState({status})),
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
                {t.description && t.description.length > 0 && (
                    <div
                        className={`card-content ${styles.description}`}
                        dangerouslySetInnerHTML={{__html: markdown(t.description)}}
                    />
                )}
            </div>
        );
    }

    render() {
        const {publicTeams, filterText, status, error} = this.state;

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
                            className={`input is-medium ${error && 'is-danger'}`}
                            type="text"
                            placeholder="Search teams"
                            onChange={e => this.handleSearch(e)}
                        />
                    </p>
                    <div className="content">
                        {(status === 'loadingPublic' || publicTeams.length === 0) && (
                            <div className="card is-fullwidth">
                                <div className="card-header">
                                    <div className="card-header-title">
                                        {status === 'loadingPublic' ?
                                            'Loading...' :
                                            'No unjoined teams found!'}
                                    </div>
                                </div>
                            </div>
                        )}
                        {status !== 'loadingPublic' &&
                            publicTeams
                            .filter(t => t.name.toLowerCase().includes(filterText))
                            .map(t => this.renderTeam(t))}
                    </div>
                </div>
            </div>
        );
    }
}
