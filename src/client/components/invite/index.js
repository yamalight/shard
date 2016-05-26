import React from 'react';
import store$, {inviteUser} from '../../store';

export default class Invite extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentTeam: {},
            currentChannel: {},
        };
    }

    componentWillMount() {
        this.subs = [
            store$
            .map(s => s.filter((_, key) => [
                'currentChannel',
                'currentTeam',
                'invited',
                'teamError',
            ].includes(key)))
            .distinctUntilChanged(d => d, (a, b) => a.equals(b))
            .map(s => s.toJS())
            .do(s => s.invited && this.close())
            .subscribe(s => this.setState(s)),
        ];
    }
    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    }

    handleKey(e) {
        if (e.key === 'Enter') {
            this.invite();
        }
    }

    invite() {
        inviteUser({
            username: this.nameInput.value,
            team: this.state.currentTeam.id,
            channel: this.state.currentChannel && this.state.currentChannel.id,
        });
    }

    close() {
        this.resetError();
        this.props.close();
    }

    resetError() {
        store$.clear({teamError: undefined, invited: false});
    }

    render() {
        const inviteUrl = `${window.location.origin}/join/${this.state.currentTeam.id}/${this.state.currentChannel.id}`;

        return (
            <div className="card is-fullwidth">
                <header className="card-header">
                    <p className="card-header-title">
                        Invite more people to {this.state.currentTeam.name}
                        {this.state.currentChannel.name && `#${this.state.currentChannel.name}`}
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
                        <p className="control">
                            <input
                                className="input is-medium"
                                type="text"
                                placeholder="Enter username to invite.."
                                ref={t => { this.nameInput = t; }}
                                onKeyPress={e => this.handleKey(e)}
                            />
                        </p>
                        <p className="control has-icon" onClick={() => this.urlInput.select()}>
                            <input
                                className="input is-disabled"
                                type="text"
                                value={inviteUrl}
                                ref={t => { this.urlInput = t; }}
                                readOnly
                            />
                            <i className="fa fa-link" />
                        </p>
                    </div>
                </div>
                <footer className="card-footer">
                    <a className="card-footer-item" onClick={() => this.invite()}>Invite</a>
                    <a className="card-footer-item" onClick={() => this.close()}>Cancel</a>
                </footer>
            </div>
        );
    }
}
