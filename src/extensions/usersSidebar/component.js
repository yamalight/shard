import styles from './component.css';

export default ({React, store$, extension}) => class UsersBar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            users: undefined,
            currentTeam: undefined,
            currentChannel: undefined,
            status: 'loading',
        };
    }

    componentWillMount() {
        this.subs = [
            // get current team and channel
            store$
            .map(s => s.filter((v, key) => ['currentTeam', 'currentChannel'].includes(key)))
            .distinctUntilChanged(d => d, (a, b) =>
                a.getIn(['currentTeam', 'id']) === b.getIn(['currentTeam', 'id']) &&
                a.getIn(['currentChannel', 'id']) === b.getIn(['currentChannel', 'id'])
            )
            .map(s => s.toJS())
            .do(s => this.getUsers(s))
            .subscribe(s => this.setState(s)),
        ];
    }
    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    }

    getUsers(s) {
        if (s.currentTeam && s.currentTeam.id && s.currentChannel && s.currentChannel.id) {
            // if already requested for this chat - ignore action
            if (this.state.requestedForChannel === (s.currentTeam.id + s.currentChannel.id)) {
                return;
            }
            if (this.sub) {
                this.sub.dispose();
            }

            // construct request
            const params = {
                team: s.currentTeam.id,
                channel: s.currentChannel.id,
            };
            // setup listener
            this.sub = extension.getUsers(params)
                .subscribe(({users}) => {
                    this.sub.dispose();
                    this.setState({users, status: 'done'});
                });
            // set flag to not repeat that
            this.setState({status: 'loading', requestedForChannel: s.currentTeam.id + s.currentChannel.id});
        }
    }

    render() {
        if (this.state.status === 'loading') {
            return <div>Loading users...</div>;
        }

        return (
            <div>
                Users in current channel:
                {this.state.users.map(u => (
                    <div className={`card is-fullwidth ${styles.user}`} key={u.id}>
                        <header className="card-header">
                            <div className={`card-header-title ${styles.userHeader}`}>
                                <span className="icon is-small">
                                    <i className="fa fa-user" />
                                </span>
                                <p className="is-flex">{u.username}</p>
                            </div>
                        </header>
                    </div>
                ))}
            </div>
        );
    }
};
