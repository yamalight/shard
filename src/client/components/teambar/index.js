import React from 'react';
import Portal from 'react-portal';
import {browserHistory} from 'react-router';
import store$, {getTeams, setTeam, resetNewTeam} from '../../store';
import styles from './teambar.css';

import Modal from '../modal';
import NewTeam from '../newteam';

const Teambar = React.createClass({
    getInitialState() {
        return {
            teams: [],
            showCreateTeam: false,
        };
    },

    componentWillMount() {
        this.subs = [
            store$
            .map(s => s.filter((_, key) => ['teams', 'newTeam', 'currentTeam'].includes(key)))
            .distinctUntilChanged()
            .map(s => s.toJS())
            .subscribe(s => this.setState(s)),
        ];

        getTeams();
    },
    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    },

    setTeam(team) {
        setTeam(team);
        console.log('team', team);
        browserHistory.push(`/channels/${team.id}`);
    },

    closeCreateTeam(refetch = false) {
        // hide dialoge
        this.setState({showCreateTeam: false});
        // reset new team
        resetNewTeam();
        // refetch teams if needed
        if (refetch) {
            getTeams();
        }
    },

    isCurrent(team) {
        return this.state.currentTeam && this.state.currentTeam.id === team.id;
    },

    render() {
        return (
            <div className={styles.teambar}>
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

                {/* Modal for team creation */}
                <Portal closeOnEsc isOpened={this.state.showCreateTeam}>
                    <Modal closeAction={this.closeCreateTeam}>
                        <NewTeam close={this.closeCreateTeam} />
                    </Modal>
                </Portal>
            </div>
        );
    },
});

export default Teambar;
