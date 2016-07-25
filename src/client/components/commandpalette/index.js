import _ from 'lodash';
import {Subject} from 'rx';
import Mousetrap from 'mousetrap';
import React from 'react';
import Portal from 'react-portal';
import styles from './commandpalette.css';

// components
import Modal from '../modal';

// store and actions
import store$ from '../../store';

// utils
import {suggestTypeahead} from './suggest';

export const handleCommandPaletteEvent = (e) => {
    if (e.keyCode === 75 && (e.ctrlKey || e.metaKey)) { // ctrl|meta + K
        e.preventDefault();
        Mousetrap.trigger('ctrl+k');
        return true;
    }

    return false;
};

export default class CommandPalette extends React.Component {
    constructor(props) {
        super(props);

        // bind keys
        Mousetrap.bind(['command+k', 'ctrl+k'], () => {
            this.setState({opened: true});
            setTimeout(() => this._text.focus(), 10);
        });

        this.typeaheadInput = new Subject();

        this.state = {
            opened: false,
            selectedIndex: 0,
            teams: [],
            channels: [],
        };
    }

    componentWillMount() {
        this.subs = [
            store$
            .map(s => s.filter((v, key) => [
                'teams',
                'channels',
            ].includes(key)))
            .distinctUntilChanged(d => d, (a, b) => a.equals(b))
            .map(s => s.toJS())
            .subscribe(s => this.setState(s)),

            this.typeaheadInput
            .distinctUntilChanged()
            .subscribe(v => this.typeahead(v)),
        ];
    }
    componentDidMount() {
        if (this._text) {
            this._text.focus();
        }
    }
    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(this.state, nextState);
    }
    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    }

    close() {
        this.typeahead('');
        this.setState({opened: false});
    }

    typeaheadItem(it, idx) {
        if (!it.action) {
            return (
                <div key={it.name} className="panel-block">
                    {it.name}
                </div>
            );
        }

        return (
            <a
                key={it.name}
                className={`panel-block ${idx === this.state.selectedIndex ? styles.active : ''}`}
                onClick={() => this.action(it)}
            >
                <span className="panel-icon">
                    <i className={`fa ${it.icon}`} />
                </span>
                {it.name}
            </a>
        );
    }

    action(it) {
        const ctx = {
            input: this._text,
            close: () => this.close(),
        };
        it.action(ctx);
    }

    handleKeyDown(e) {
        // handle up-down
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            const inc = e.key === 'ArrowUp' ? -1 : 1;
            const currentIndex = this.state.selectedIndex;
            let selectedIndex = currentIndex + inc;
            if (selectedIndex >= this.state.typeahead.length) {
                selectedIndex = 0;
            }
            if (selectedIndex < 0) {
                selectedIndex = this.state.typeahead.length - 1;
            }
            this.setState({selectedIndex});
        }
    }

    handleKeyPress(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const it = this.state.typeahead[this.state.selectedIndex];
            this.action(it);
            return;
        }
    }

    handleKeyUp(e) {
        this.typeaheadInput.onNext(e.target.value);
    }

    typeahead(command) {
        if (!command || !command.length) {
            this.setState({typeahead: [], selectedIndex: 0});
            return;
        }

        const typeahead = suggestTypeahead(command, this.state);
        this.setState({typeahead, selectedIndex: 0});
    }

    renderTypeahead() {
        if (!this.state.typeahead || !this.state.typeahead.length) {
            return undefined;
        }

        return (
            <div>{this.state.typeahead.map((it, idx) => this.typeaheadItem(it, idx))}</div>
        );
    }

    render() {
        if (!this.state.opened) {
            return <span />;
        }

        return (
            <Portal closeOnEsc onClose={() => this.close()} isOpened>
                <Modal closeAction={() => this.close()}>
                    <div className={`box ${styles.smallBox}`}>
                        <div className="media-content panel">
                            <p className={`control ${styles.input}`}>
                                <input
                                    ref={t => { this._text = t; }}
                                    className="input is-medium"
                                    placeholder="Type '?' to get help on the actions you can take from here"
                                    type="text"
                                    onKeyPress={e => this.handleKeyPress(e)}
                                    onKeyUp={e => this.handleKeyUp(e)}
                                    onKeyDown={e => this.handleKeyDown(e)}
                                />
                            </p>
                            {this.renderTypeahead()}
                        </div>
                    </div>
                </Modal>
            </Portal>
        );
    }
}
