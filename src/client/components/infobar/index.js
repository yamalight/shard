import React from 'react';
import styles from './infobar.css';

import store$, {setInfobar} from '../../store';

export default class Infobar extends React.Component {
    constructor(props) {
        super(props);

        const storedWidth = localStorage.getItem('shard.infobar.width');
        const width = storedWidth ? parseInt(storedWidth, 10) : 300;

        this.state = {
            title: 'Infobar',
            content: 'Loading...',
            resizing: false,
            width,
        };
    }

    componentWillMount() {
        this.subs = [
            store$
            .map(s => s.filter((v, key) => ['infobar', 'currentChannel'].includes(key)))
            .filter(s => s !== undefined)
            .distinctUntilChanged(d => d, (a, b) => a.equals(b))
            .map(s => s.toJS())
            .subscribe(s => this.setState(s)),
        ];

        this.upHandler = e => this.handleResizeMouseUp(e);
        this.moveHandler = e => this.handleResizeMouseMove(e);
        window.addEventListener('mouseup', this.upHandler);
        window.addEventListener('mousemove', this.moveHandler);
    }
    componentWillUnmount() {
        this.subs.map(s => s.dispose());

        window.removeEventListener('mouseup', this.upHandler);
        window.removeEventListener('mousemove', this.moveHandler);
    }

    hide() {
        setInfobar({});
    }

    handleResizeMouseDown() {
        this.setState({resizing: true});
    }
    handleResizeMouseUp() {
        this.setState({resizing: false});
    }
    handleResizeMouseMove(e) {
        if (!this.state || !this.state.resizing) {
            return;
        }

        e.preventDefault();

        const {clientX: x} = e;
        const newWidth = window.innerWidth - x;
        const width = newWidth < 300 ? 300 : newWidth;

        // update view
        this.setState({width});
        // persist value for user
        localStorage.setItem('shard.infobar.width', width);
    }

    renderResizer() {
        return <div className={styles.resizer} onMouseDown={() => this.handleResizeMouseDown()} />;
    }

    render() {
        if (!this.state.currentChannel || !this.state.currentChannel.id) {
            return <span />;
        }

        return (
            <div className={`card is-flex ${styles.infobar}`} style={{width: this.state.width}}>
                {this.renderResizer()}

                <header className={`card-header ${styles.header}`}>
                    <p className="card-header-title">
                        {this.state.infobar.title}
                    </p>
                    {/* <a className="card-header-icon" onClick={() => this.hide()}>
                        <i className="fa fa-times"></i>
                    </a> */}
                </header>
                <div className={`card-content ${styles.cardContent}`}>
                    <div className={`content ${styles.content}`}>
                        {this.state.infobar.content}
                    </div>
                </div>
            </div>
        );
    }
}
