import {Map} from 'immutable';
import React from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import styles from './infobar.css';

import store$, {setInfobarType, setInfobarVisible} from '../../store';

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
            .map(s => s.filter((v, key) => ['infobarType', 'currentChannel'].includes(key)))
            .filter(s => s !== undefined)
            .distinctUntilChanged(d => d, (a, b) => a.equals(b))
            .map(s => s.toJS())
            .subscribe(s => this.setState(s)),

            // infobar content sub
            store$
            .map(s => s.get('infobar'))
            .filter(s => s !== undefined)
            // TODO: investigate why extensions are not converted to ImmutableJS
            .map(s => (Map.isMap(s) ? s.toJS() : s))
            .distinctUntilChanged(it => it.id)
            .map(infobar => {
                const infobarContent = infobar ? infobar.content() : '';
                return {infobar, infobarContent};
            })
            .subscribe(s => this.setState(s)),
        ];

        this.upHandler = e => this.handleResizeMouseUp(e);
        this.moveHandler = e => this.handleResizeMouseMove(e);
        window.addEventListener('mouseup', this.upHandler);
        window.addEventListener('mousemove', this.moveHandler);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState);
    }

    componentWillUnmount() {
        this.subs.map(s => s.dispose());

        window.removeEventListener('mouseup', this.upHandler);
        window.removeEventListener('mousemove', this.moveHandler);
    }

    toggleType() {
        const type = this.state.infobarType === 'dock' ? 'sidebar' : 'dock';
        setInfobarType(type);
        if (type === 'dock') {
            setInfobarVisible(true);
        }
    }

    hideDock() {
        setInfobarVisible(false);
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
        // only render for sidebar
        if (this.state.infobarType !== 'sidebar') {
            return null;
        }

        return <div className={styles.resizer} onMouseDown={() => this.handleResizeMouseDown()} />;
    }

    render() {
        const {infobar, infobarType, infobarContent, currentChannel, width} = this.state;

        if (!currentChannel || !currentChannel.id || !infobar || !infobar.title || !infobar.content) {
            return <span />;
        }

        const icon = infobarType === 'sidebar' ? 'fa-expand' : 'fa-compress';
        const style = infobarType === 'sidebar' ? {width} : {width: '100%'};

        return (
            <div className={`card is-flex ${styles.infobar}`} style={style}>
                {this.renderResizer()}

                <header className={`card-header ${styles.header}`}>
                    <p className="card-header-title">
                        {infobar.title}
                    </p>
                    <a className="card-header-icon" onClick={() => this.toggleType()}>
                        <i className={`fa ${icon} ${styles.expandButton}`} />
                    </a>
                    {infobarType === 'dock' && (
                        <a className="card-header-icon" onClick={() => this.hideDock()}>
                            <i className={`fa fa-times ${styles.expandButton}`} />
                        </a>
                    )}
                </header>
                <div className={`card-content ${styles.cardContent}`}>
                    <div className={`content ${styles.content}`}>
                        {infobarContent}
                    </div>
                </div>
            </div>
        );
    }
}
