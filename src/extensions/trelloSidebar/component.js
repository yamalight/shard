import shallowCompare from 'react-addons-shallow-compare';
import styles from './component.css';

export default ({React, store$, extension}) => class TrelloBar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            board: undefined,
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
            .do(s => this.getBoard(s))
            .subscribe(s => this.setState(s)),
        ];
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState);
    }

    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    }

    getBoard(s) {
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

            // get board data
            extension
            .getBoard(params)
            .subscribe(board => this.setState({board, status: 'done'}));
        }
    }

    saveBoard() {
        const boardLink = this._input.value;

        // construct request
        const params = {
            team: this.state.currentTeam.id,
            channel: this.state.currentChannel.id,
            board: boardLink,
        };

        // save board data
        extension
        .setBoard(params)
        .subscribe(board => this.setState({board, status: 'done'}));
    }

    cancelEdit() {
        this.setState({board: this.state.oldBoard});
    }

    renderSetBoard() {
        const val = this.state.oldBoard ? this.state.oldBoard.board : '';

        return (
            <div className={styles.container}>
                {!this.state.oldBoard && (
                    <p>No board URL set, please add one now.</p>
                )}
                <p className="control">
                    <input
                        className="input is-medium"
                        type="text"
                        placeholder="Enter board embed URL.."
                        defaultValue={val}
                        ref={t => { this._input = t; }}
                    />
                </p>
                <a className="button is-success" onClick={() => this.saveBoard()}>Save</a>
                {this.state.oldBoard && (
                    <a className="button" onClick={() => this.cancelEdit()}>Cancel</a>
                )}
            </div>
        );
    }

    render() {
        if (this.state.status === 'loading') {
            return <div className={styles.container}>Loading board...</div>;
        }

        const board = this.state.board || {};

        if (this.state.status === 'failed') {
            return (
                <div className={styles.container}>
                    <a
                        className="button is-small is-link"
                        onClick={() => this.setState({board: {}, oldBoard: board, status: 'done'})}
                    >
                        Edit
                    </a>
                    <p>There was an error loading board :(</p>
                </div>
            );
        }

        if (!board.board) {
            return this.renderSetBoard();
        }

        return (
            <div className={styles.container}>
                <a
                    className="button is-small is-link"
                    onClick={() => this.setState({board: {}, oldBoard: board})}
                >
                    Edit
                </a>
                <iframe
                    src={board.board}
                    style={{border: 0}}
                    width="100%"
                    height="800"
                    frameBorder="0"
                    scrolling="no"
                />
            </div>
        );
    }
};
