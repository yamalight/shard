import React from 'react';
import store$ from '../../store';

const Invite = React.createClass({
    getInitialState() {
        return {
            currentTeam: {},
            currentChannel: {},
        };
    },

    componentWillMount() {
        this.subs = [
            store$
            .map(s => s.filter((_, key) => ['currentChannel', 'currentTeam'].includes(key)))
            .map(s => s.toJS())
            .subscribe(s => this.setState(s)),
        ];
    },
    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    },

    invite() {
        console.log('invite:', this.nameInput.value);
    },

    close() {
        this.props.close();
    },

    render() {
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
                        <p className="control">
                            <input
                                className="input is-medium"
                                type="text"
                                placeholder="Enter username.."
                                ref={t => { this.nameInput = t; }}
                            />
                        </p>
                    </div>
                </div>
                <footer className="card-footer">
                    <a className="card-footer-item" onClick={this.invite}>Invite</a>
                    <a className="card-footer-item" onClick={this.close}>Cancel</a>
                </footer>
            </div>
        );
    },
});

export default Invite;
