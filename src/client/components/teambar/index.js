import _ from 'lodash';
import React from 'react';
import Portal from 'react-portal';
import {browserHistory} from 'react-router';
import styles from './teambar.css';

// components
import Modal from '../modal';
import NewTeam from '../newteam';

// store and actions
import store$, {getTeams, setTeam, resetNewTeam} from '../../store';

export default class Teambar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            teams: [],
            showCreateTeam: false,
        };

        getTeams();
    }

    componentWillMount() {
        this.subs = [
            store$
            .map(s => s.filter((v, key) => ['teamStatus', 'teams', 'newTeam', 'currentTeam'].includes(key)))
            .distinctUntilChanged(d => d, (a, b) => a.equals(b))
            .map(s => s.toJS())
            .subscribe(s => this.setState(s)),
        ];
    }

    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    }

    setTeam(team) {
        setTeam(team);
        browserHistory.push(`/channels/${_.camelCase(team.name)}`);
    }

    closeCreateTeam(refetch = false) {
        // hide dialoge
        this.setState({showCreateTeam: false});
        // reset new team
        resetNewTeam();
        // refetch teams if needed
        if (refetch) {
            getTeams();
        }
    }

    isCurrent(team) {
        return this.state.currentTeam && this.state.currentTeam.id === team.id;
    }

    render() {
        return (
            <div className={styles.teambar}>
                {this.state.teamStatus === 'loading' && (
                    <a className={styles.iconButton}>
                        <span className="icon is-large icon-loading">
                            <i className="fa fa-circle"></i>
                        </span>
                    </a>
                )}

                {/*
                TODO: Uncomment later when DM functionality is implemented
                <a href="#" className={styles.iconButton}>
                    <span className="icon is-large hint--right hint--info" data-hint="Direct messages">
                        <i className="fa fa-users"></i>
                    </span>
                </a>

                <div className={styles.separator} />
                */}

                {/* Teams list */}
                {this.state.teams && this.state.teams.map(team => (
                    <a
                        key={team.id}
                        className={`${styles.iconButton} ${this.isCurrent(team) || styles.iconButtonFaded}`}
                        onClick={() => this.setTeam(team)}
                    >
                        <span className="icon is-large hint--right hint--info" data-hint={team.name}>
                            <i className="fa fa-circle"></i>
                            <span className={styles.teamLetter}>{team.name[0]}</span>
                        </span>
                    </a>
                ))}
                {/* Team create button */}
                <a
                    className={`${styles.iconButton} ${styles.iconButtonFaded}`}
                    onClick={() => this.setState({showCreateTeam: true})}
                >
                    <span className="icon is-large hint--right hint--info" data-hint="Create new team">
                        <i className="fa fa-plus-circle"></i>
                    </span>
                </a>


                {/* Sidebar toggle button */}
                <div className={styles.spacer} />
                <div className={styles.separator} />
                <a className={styles.iconButton} onClick={() => this.props.toggleSidebar()}>
                    <span className="icon is-large hint--right hint--info" data-hint="Toggle sidebar">
                        <i className={`fa fa-${this.props.showSidebar ? 'toggle-off' : 'toggle-on'}`} />
                    </span>
                </a>

                {/* Modal for team creation */}
                <Portal closeOnEsc onClose={() => this.closeCreateTeam()} isOpened={this.state.showCreateTeam}>
                    <Modal closeAction={() => this.closeCreateTeam()}>
                        <NewTeam close={refetch => this.closeCreateTeam(refetch)} />
                    </Modal>
                </Portal>
            </div>
        );
    }
}
