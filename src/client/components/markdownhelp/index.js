import React from 'react';
import Portal from 'react-portal';
import Mousetrap from 'mousetrap';
import shallowCompare from 'react-addons-shallow-compare';
// import styles from './markdownhelp.css';
import {markdown} from '../../util';

// components
import Modal from '../modal';

import cheatsheet from './cheatsheet';

export default class MarkdownHelp extends React.Component {
    constructor(props) {
        super(props);

        // bind keys
        Mousetrap.bind(['command+shift+\\', 'ctrl+shift+\\'], () => this.setState({opened: true}));

        this.state = {
            opened: false,
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState);
    }

    close() {
        this.setState({opened: false});
    }

    render() {
        const {opened} = this.state;

        if (!opened) {
            return <span />;
        }

        return (
            <Portal closeOnEsc onClose={() => this.close()} isOpened>
                <Modal closeAction={() => this.close()}>
                    <div className="card is-fullwidth">
                        <header className="card-header">
                            <p className="card-header-title">
                                Markdown cheatsheet
                            </p>
                        </header>
                        <div className="card-content">
                            <div
                                className="content"
                                dangerouslySetInnerHTML={{__html: markdown(cheatsheet)}}
                            />
                        </div>
                    </div>
                </Modal>
            </Portal>
        );
    }
}
