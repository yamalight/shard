import React from 'react';
import Portal from 'react-portal';
import shallowCompare from 'react-addons-shallow-compare';
import styles from './teambar.css';

// components
import Modal from '../modal';
import NewTeam from '../newteam';
import JoinTeam from '../jointeam';

// store and actions
import store$, {getTeams, getPublicTeams, setTeam, resetNewTeam} from '../../store';

// util
import {meTeam} from '../../util';

export default class Teambar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            teams: [],
            showJoinTeam: false,
            showCreateTeam: false,
        };

        getTeams();
    }

    componentWillMount() {
        this.subs = [
            store$
            .map(s => s.filter((v, key) => ['teamStatus', 'teams', 'currentTeam'].includes(key)))
            .distinctUntilChanged(d => d, (a, b) => a.equals(b))
            .map(s => s.toJS())
            .subscribe(s => this.setState(s)),
        ];
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState);
    }

    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    }

    setTeam(team) {
        setTeam(team);
    }

    closeCreateTeam() {
        // hide dialoge
        this.setState({showCreateTeam: false});
        // reset new team
        resetNewTeam();
    }

    showJoinTeam() {
        getPublicTeams();
        this.setState({showJoinTeam: true});
    }
    closeJoinTeam() {
        // hide modal
        this.setState({showJoinTeam: false});
    }

    isCurrent(team) {
        return this.state.currentTeam && this.state.currentTeam.id === team.id;
    }

    renderTeam(team) {
        // render meTeam if needed
        if (team.id === meTeam.id) {
            return [
                <a
                    key={team.id}
                    className={`${styles.iconButton} ${this.isCurrent(meTeam) || styles.iconButtonFaded}`}
                    onClick={() => setTeam(meTeam)}
                >
                    <span className="icon is-large hint--right hint--info" data-hint="Direct messages">
                        <i className="fa fa-users" />
                        {team.unread > 0 && (
                            <span className={`tag is-info is-small ${styles.teamCount}`}>
                                {team.unread}
                            </span>
                        )}
                    </span>
                </a>,
                <div key="separator" className={styles.separator} />,
            ];
        }

        return (
            <a
                key={team.id}
                className={`${styles.iconButton} ${this.isCurrent(team) || styles.iconButtonFaded}`}
                onClick={() => this.setTeam(team)}
            >
                <span className="icon is-large hint--right hint--info" data-hint={team.name}>
                    <i className="fa fa-circle"></i>
                    <span className={styles.teamLetter}>{team.name[0]}</span>
                    {team.unread > 0 && (
                        <span className={`tag is-info is-small ${styles.teamCount}`}>
                            {team.unread}
                        </span>
                    )}
                </span>
            </a>
        );
    }

    renderTeams() {
        if (!this.state.teams) {
            return null;
        }

        return this.state.teams.map(team => this.renderTeam(team));
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

                {/* Teams list */}
                {this.renderTeams()}

                <div className={styles.separatorMini} />

                {/* Team create button */}
                <a
                    className={`${styles.iconButton} ${styles.iconButtonFaded}`}
                    onClick={() => this.setState({showCreateTeam: true})}
                >
                    <span className="icon is-large hint--right hint--info" data-hint="Create new team">
                        <i className="fa fa-plus-circle"></i>
                    </span>
                </a>

                <div className={styles.separatorMini} />

                {/* Join a team button */}
                <a
                    className={`${styles.iconButton} ${styles.iconButtonFaded}`}
                    onClick={() => this.showJoinTeam()}
                >
                    <span className="icon is-large hint--right hint--info" data-hint="Join a team">
                        <i className="fa fa-check-circle"></i>
                    </span>
                </a>


                {/* Sidebar toggle button */}
                <div className="is-spacer" />
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

                {/* Modal for joining team */}
                <Portal closeOnEsc onClose={() => this.closeJoinTeam()} isOpened={this.state.showJoinTeam}>
                    <Modal closeAction={() => this.closeJoinTeam()}>
                        <JoinTeam close={refetch => this.closeJoinTeam(refetch)} />
                    </Modal>
                </Portal>
            </div>
        );
    }
}
