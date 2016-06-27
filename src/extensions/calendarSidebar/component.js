import shallowCompare from 'react-addons-shallow-compare';
import styles from './component.css';

export default ({React, store$, extension}) => class UsersBar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            calendar: undefined,
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
            .do(s => this.getCalendar(s))
            .subscribe(s => this.setState(s)),
        ];
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState);
    }

    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    }

    getCalendar(s) {
        if (s.currentTeam && s.currentTeam.id && s.currentChannel && s.currentChannel.id) {
            // if already requested for this chat - ignore action
            if (this.state.requestedForChannel === (s.currentTeam.id + s.currentChannel.id)) {
                return;
            }

            // construct request
            const params = {
                team: s.currentTeam.id,
                channel: s.currentChannel.id,
            };

            // set flag to not repeat that
            this.setState({status: 'loading', requestedForChannel: s.currentTeam.id + s.currentChannel.id});

            // get calendar data
            extension
            .getCalendar(params)
            .subscribe(calendar => this.setState({calendar, status: 'done'}));
        }
    }

    saveCalendar() {
        const calendarLink = this._input.value;

        // construct request
        const params = {
            team: this.state.currentTeam.id,
            channel: this.state.currentChannel.id,
            calendar: calendarLink,
        };

        // save calendar data
        extension
        .setCalendar(params)
        .subscribe(calendar => this.setState({calendar, status: 'done'}));
    }

    cancelEdit() {
        this.setState({calendar: this.state.oldCalendar});
    }

    handleLoad(e) {
        // check for contentwindow length to catch ORIGIN header error
        // TODO: this feels hacky, is that a correct way? is there a better way?
        if (e.target.contentWindow.length === 0) {
            this.setState({status: 'failed'});
        }
    }

    renderSetCalendar() {
        const val = this.state.oldCalendar ? this.state.oldCalendar.calendar : '';

        return (
            <div className={styles.container}>
                {!this.state.oldCalendar && (
                    <p>No URL calendar set, please add one now.</p>
                )}
                <p className="control">
                    <input
                        className="input is-medium"
                        type="text"
                        placeholder="Enter calendar embed URL.."
                        defaultValue={val}
                        ref={t => { this._input = t; }}
                    />
                </p>
                <a className="button is-success" onClick={() => this.saveCalendar()}>Save</a>
                {this.state.oldCalendar && (
                    <a className="button" onClick={() => this.cancelEdit()}>Cancel</a>
                )}
            </div>
        );
    }

    render() {
        if (this.state.status === 'loading') {
            return <div className={styles.container}>Loading calendar...</div>;
        }

        const calendar = this.state.calendar || {};

        if (this.state.status === 'failed') {
            return (
                <div className={styles.container}>
                    <a
                        className="button is-small is-link"
                        onClick={() => this.setState({calendar: {}, oldCalendar: calendar, status: 'done'})}
                    >
                        Edit
                    </a>
                    <p>There was an error loading calendar :(</p>
                </div>
            );
        }

        if (!calendar.calendar) {
            return this.renderSetCalendar();
        }

        return (
            <div className={styles.container}>
                <a
                    className="button is-small is-link"
                    onClick={() => this.setState({calendar: {}, oldCalendar: calendar})}
                >
                    Edit
                </a>
                <iframe
                    src={calendar.calendar}
                    style={{border: 0}}
                    width="800"
                    height="600"
                    frameBorder="0"
                    scrolling="no"
                    onLoad={e => this.handleLoad(e)}
                />
            </div>
        );
    }
};
