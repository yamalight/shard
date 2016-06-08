import React from 'react';
import styles from './newconversation.css';
import store$, {startDM, findUser} from '../../store';

export default class NewConversation extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            users: [],
            error: undefined,
        };
    }

    componentWillMount() {
        this.subs = [
            store$
            .map(s => s.filter((_, key) => ['users', 'createdDM'].includes(key)))
            .distinctUntilChanged(d => d, (a, b) => a.equals(b))
            .map(s => s.toJS())
            .do(s => s.createdDM && this.close(s.createdDM))
            .subscribe(s => this.setState(s)),

            // status sub
            store$
            .map(s => s.get('userStatus'))
            .distinctUntilChanged()
            .subscribe(status => this.setState({status})),
        ];
    }
    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    }

    handleSearch(e) {
        const username = e.target.value;
        if (username.length < 2) {
            return;
        }
        findUser({username});
    }

    start(user) {
        startDM({user: user.id});
    }

    close(ch) {
        store$.clear({createdDM: undefined});
        this.props.close(ch);
    }

    renderUser(u) {
        return (
            <div className={`card is-fullwidth ${styles.channel}`} key={u.id} onClick={() => this.start(u)}>
                <header className="card-header">
                    <div className={`card-header-title ${styles.channelHeader}`}>
                        <span className="icon is-small">
                            <i className="fa fa-user" />
                        </span>
                        <p className="is-flex">{u.username}</p>
                    </div>
                </header>
            </div>
        );
    }

    render() {
        const {error, status, users} = this.state;

        return (
            <div className="card is-fullwidth">
                <header className="card-header">
                    <p className="card-header-title">
                        Start a new conversation
                    </p>
                </header>
                <div className="card-content">
                    <p className="control">
                        <input
                            className={`input is-medium ${error && 'is-danger'}`}
                            type="text"
                            placeholder="Search users"
                            onChange={e => this.handleSearch(e)}
                        />
                    </p>
                    <div className="content">
                        {(status === 'loadingPublic' || users.length === 0) && (
                            <div className="card is-fullwidth">
                                <div className="card-header">
                                    <div className="card-header-title">
                                        {status === 'loadingPublic' ?
                                            'Loading...' :
                                            'No users without existing conversations found!'}
                                    </div>
                                </div>
                            </div>
                        )}
                        {status !== 'loadingPublic' &&
                            users
                            .map(u => this.renderUser(u))}
                    </div>
                </div>
            </div>
        );
    }
}
