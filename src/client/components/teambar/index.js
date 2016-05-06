import React from 'react';
import Portal from 'react-portal';
import store$, {getTeams, setTeam} from '../../store';
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
            .map(s => s.toJS())
            .subscribe(s => this.setState(s)),
        ];

        getTeams();
    },
    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    },

    closeCreateTeam(refetch = false) {
        this.setState({showCreateTeam: false});
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
                <a href="#" className={styles.iconButton}>
                    <span className="icon is-large hint--right hint--info" data-hint="Direct messages">
                        <i className="fa fa-users"></i>
                    </span>
                </a>

                <div className={styles.separator} />

                {/* Teams list */}
                {this.state.teams && this.state.teams.map(team => (
                    <a
                        key={team.id}
                        className={`${styles.iconButton} ${this.isCurrent(team) || styles.iconButtonFaded}`}
                        onClick={() => setTeam(team)}
                    >
                        <span className="icon is-large hint--right hint--info" data-hint={team.name}>
                            <i className="fa fa-circle"></i>
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
