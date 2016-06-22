import React from 'react';
import Mousetrap from 'mousetrap';
import Portal from 'react-portal';
import styles from './hotkeyhelp.css';

// components
import Modal from '../modal';


export default class HotkeyHelp extends React.Component {
    constructor(props) {
        super(props);

        // bind keys
        Mousetrap.bind(['command+/', 'ctrl+/'], () => {
            this.setState({opened: true});
            setTimeout(() => this._text.focus(), 10);
        });

        this.state = {
            opened: false,
            isMac: window.navigator.platform.includes('Mac'),
        };
    }

    close() {
        this.setState({opened: false});
    }

    render() {
        const {opened, isMac} = this.state;
        const ctrlKey = isMac ? 'Cmd' : 'Ctrl';

        return (
            <Portal closeOnEsc onClose={() => this.close()} isOpened={opened}>
                <Modal closeAction={() => this.close()}>
                    <div className="card is-fullwidth">
                        <header className="card-header">
                            <p className="card-header-title">
                                <span className={styles.description}>Keyboard Shortcuts</span>
                                <kbd>{ctrlKey}</kbd><kbd>/</kbd>
                            </p>
                        </header>
                        <div className="card-content">
                            <div className="content">
                                <div className="column">
                                    <span className={styles.description}>Command pallette:</span>
                                    <kbd>{ctrlKey}</kbd><kbd>k</kbd>
                                </div>
                                <div className="column">
                                    <span className={styles.description}>Edit last message:</span>
                                    <kbd>↑</kbd> in input
                                </div>
                                <div className="column">
                                    <span className={styles.description}>New line:</span>
                                    <kbd>Shift</kbd><kbd>Enter</kbd>
                                </div>
                                <div className="column">
                                    <span className={styles.description}>Dismiss Dialogs:</span>
                                    <kbd>Esc</kbd>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            </Portal>
        );
    }
}
