import _ from 'lodash';
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

        this.dataSubs = [];
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
        this.dataSubs.map(sub => sub.dispose());
    }

    sortUsers(users) {
        return _.sortBy(users, u => (u.status === 'online' ? -1 : 1), 'username');
    }

    getUsers(s) {
        if (s.currentTeam && s.currentTeam.id && s.currentChannel && s.currentChannel.id) {
            // if already requested for this chat - ignore action
            if (this.state.requestedForChannel === (s.currentTeam.id + s.currentChannel.id)) {
                return;
            }

            // cleanup subs
            this.dataSubs.map(sub => sub.dispose());

            // construct request
            const params = {
                team: s.currentTeam.id,
                channel: s.currentChannel.id,
            };
            this.dataSubs = [
                // init socket for users updates
                extension
                .initUsersStream(params)
                .map(event => JSON.parse(event.data))
                .map(user => {
                    const {users} = this.state;
                    const index = users.findIndex(el => el.id === user.id);
                    users[index] = user;
                    return this.sortUsers(users);
                })
                .subscribe(users => this.setState({users})),
                // get initial users data
                extension
                .getUsers(params)
                .map(({users}) => this.sortUsers(users))
                .subscribe(users => this.setState({users, status: 'done'})),
            ];
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
                        <header className={`card-header ${u.status === 'offline' ? styles.offline : ''}`}>
                            <div className={`card-header-title ${styles.userHeader}`}>
                                <span className={`icon is-small ${u.status === 'online' ? styles.online : ''}`}>
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
