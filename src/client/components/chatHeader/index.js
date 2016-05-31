import React from 'react';
import Portal from 'react-portal';
import styles from './chat.css';

// components
import Description from '../description';
import Dropdown from '../dropdown';
import Modal from '../modal';
import EditChannel from '../editchannel';

// store and actions
import store$, {setInfobar, getChannels} from '../../store';

export default class Chat extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentChannel: {},
            showRename: false,
        };
    }

    componentWillMount() {
        this.subs = [
            // get initial data
            store$
            .map(s => s.filter((v, key) => ['currentChannel', 'currentTeam'].includes(key)))
            .distinctUntilChanged(d => d, (a, b) => a.equals(b))
            .map(s => s.toJS())
            .map(s => ({
                ...s,
                menuItems: this.generateMenuItems(s),
            }))
            .do(s => s.menuItems[0] && this.handleMenuItem(s.menuItems[0]))
            // store to state
            .subscribe(s => this.setState(s)),
        ];
    }
    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    }

    generateMenuItems(s) {
        if (!s.currentChannel) {
            return [];
        }

        return [{
            title: 'Description',
            type: 'sidebar',
            content: <Description />,
        }, {
            title: 'Edit channel',
            type: 'action',
            content: () => this.setState({showRename: true}),
        }];
    }

    closeRename(refetch = false) {
        this.setState({showRename: false});
        if (refetch) {
            getChannels({team: this.state.currentTeam.id, refetch});
        }
    }

    showMenu() {
        this.setState({showMenu: true});
    }
    handleMenuItem(item) {
        if (item.type === 'sidebar') {
            setInfobar(item);
        } else if (item.type === 'action') {
            item.content();
        }
    }
    closeMenu() {
        this.setState({showMenu: false});
    }

    render() {
        return (
            <nav className={`navbar is-flex ${styles.navbar}`}>
                <div className="navbar-item">
                    <p className={`title channel-name is-flex ${styles.title}`}>
                        {this.state.currentChannel.name || 'No channel selected'}
                    </p>
                </div>

                <div className={styles.navSpacer} />

                {this.state.currentChannel.id && (
                    <div className={`navbar-item is-flex ${styles.navMenu}`}>
                        <a className="card-header-icon" onClick={() => this.showMenu()}>
                            <i className="fa fa-angle-down" />
                        </a>
                    </div>
                )}

                {this.state.showMenu && (
                    <Dropdown
                        style={{top: 50, right: 5}}
                        title="Channel"
                        items={this.state.menuItems}
                        onItem={it => this.handleMenuItem(it)}
                        onHide={() => this.closeMenu()}
                    />
                )}

                {/* Modal for channel rename */}
                <Portal closeOnEsc onClose={() => this.closeRename()} isOpened={this.state.showRename}>
                    <Modal closeAction={() => this.closeRename()}>
                        <EditChannel close={refetch => this.closeRename(refetch)} />
                    </Modal>
                </Portal>
            </nav>
        );
    }
}
