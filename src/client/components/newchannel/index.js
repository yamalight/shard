import React from 'react';
import store$, {createChannel} from '../../store';

const NewChannel = React.createClass({
    getInitialState() {
        return {
            currentTeam: {},
        };
    },

    componentWillMount() {
        this.subs = [
            store$
            .map(s => s.filter((_, key) => ['newChannel', 'currentTeam'].includes(key)))
            .map(s => s.toJS())
            .do(s => s.newChannel && this.close(null, true))
            .subscribe(s => this.setState(s)),
        ];
    },
    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    },

    create() {
        const name = this.nameInput.value;
        const description = this.descInput.value;
        const team = this.state.currentTeam._id;
        createChannel({name, description, team});
    },
    close(e, refetch = false) {
        this.props.close(refetch);
    },

    render() {
        return (
            <div className="card is-fullwidth">
                <header className="card-header">
                    <p className="card-header-title">
                        Create new channel
                    </p>
                </header>
                <div className="card-content">
                    <div className="content">
                        <p className="control">
                            <input
                                className="input is-medium"
                                type="text"
                                placeholder="Enter new channel name.."
                                ref={t => { this.nameInput = t; }}
                            />
                        </p>
                        <p className="control">
                            <textarea
                                className="textarea"
                                placeholder="Enter new channel description.."
                                ref={t => { this.descInput = t; }}
                            />
                        </p>
                    </div>
                </div>
                <footer className="card-footer">
                    <a className="card-footer-item" onClick={this.create}>Create</a>
                    <a className="card-footer-item" onClick={this.close}>Cancel</a>
                </footer>
            </div>
        );
    },
});

export default NewChannel;
