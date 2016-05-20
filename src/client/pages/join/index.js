import _ from 'lodash';
import React from 'react';
import {browserHistory} from 'react-router';
import styles from './join.css';

import store$, {getTeam, joinTeam} from '../../store';

const Join = React.createClass({
    getInitialState() {
        const {team, channel} = this.props.params;
        return {
            teamid: team,
            channelid: channel,
        };
    },

    componentWillMount() {
        this.subs = [
            store$
            .map(s => s.filter((v, key) => ['team', 'joinedTeam'].includes(key)))
            .distinctUntilChanged()
            .map(s => s.toJS())
            .do(s => s.joinedTeam && this.goToTeam())
            .subscribe(s => this.setState(s)),
        ];

        getTeam({team: this.state.teamid});
    },

    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    },

    joinTeam() {
        joinTeam({team: this.state.teamid, channel: this.state.channelid});
    },

    goToTeam() {
        browserHistory.push(`/channels/${_.camelCase(this.state.team.name)}`);
    },

    goHome() {
        browserHistory.push('/channels/@me');
    },

    render() {
        return (
            <section className="hero is-fullheight">
                <div className="hero-body">
                    <div className="container">
                        <div className="columns">
                            <div className="column is-fullwidth has-text-centered">
                                <h1 className="title">
                                    Shard: invitation to join awesome {this.state.team && this.state.team.name} team.
                                </h1>

                                <h2 className="subtitle">
                                    Looks like you've been invited to
                                    join amazing {this.state.team && this.state.team.name} team!
                                </h2>

                                <a className="button is-medium is-success" onClick={this.joinTeam}>
                                    Yes, let me in!
                                </a>
                                <a className={`button ${styles.homeButton}`} onClick={this.goHome}>
                                    No, go home
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    },
});

export default Join;
