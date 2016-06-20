import React from 'react';
import Portal from 'react-portal';
import styles from './chatHeader.css';
import {extensions} from '../../extensions';

// get typeahead extensions
const sidebarExtensions = extensions.filter(ex => ex.type === 'sidebar');

// components
import Description from '../description';
import Dropdown from '../dropdown';
import Modal from '../modal';
import EditChannel from '../editchannel';
import NotifySettings from '../notifysettings';

// store and actions
import store$, {setInfobar} from '../../store';

// utils
import {meTeam} from '../../util';

export default class Chat extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentChannel: {},
            showRename: false,
            showNotifications: false,
        };
    }

    componentWillMount() {
        this.subs = [
            // get initial data
            store$
            .map(s => s.filter((v, key) => ['currentChannel', 'infobarType', 'currentTeam'].includes(key)))
            .distinctUntilChanged(d => d, (a, b) => a.equals(b))
            .map(s => s.toJS())
            .map(s => ({
                ...s,
                menuItems: this.generateMenuItems(s),
            }))
            // set description sidebar
            .do(s => s.infobarType === 'sidebar' && s.menuItems[0] && this.handleMenuItem(s.menuItems[0]))
            // store to state
            .subscribe(s => this.setState(s)),
        ];
    }
    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    }

    generateMenuItems(s) {
        if (!s.currentChannel || !s.currentTeam) {
            return [];
        }

        const items = [{
            title: 'Description',
            type: 'sidebar',
            content: () => <Description />,
        }, {
            title: 'Notification settings',
            type: 'action',
            content: () => this.setState({showNotifications: true}),
        }].concat(sidebarExtensions);

        // if it's private conversation - return
        if (s.currentTeam.id === meTeam.id) {
            return items;
        }

        // otherwise add edit button
        return [
            ...items,
            {
                title: 'Edit channel',
                type: 'action',
                content: () => this.setState({showRename: true}),
            },
        ];
    }

    closeRename() {
        this.setState({showRename: false});
    }
    closeNotifications() {
        this.setState({showNotifications: false});
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

    renderName() {
        const {currentChannel, currentTeam} = this.state;

        if (currentTeam && currentChannel.name) {
            return (
                <span className={`is-flex ${styles.channelName}`}>
                    <span className="icon">
                        <i className={`fa ${currentChannel.type === 'conversation' ? 'fa-user' : 'fa-hashtag'}`} />
                    </span>
                    {currentChannel.name}
                </span>
            );
        }

        if (currentTeam && currentTeam.id === meTeam.id) {
            return 'No conversation selected';
        }

        return 'No channel selected';
    }

    render() {
        return (
            <nav className={`navbar is-flex ${styles.navbar}`}>
                <div className="navbar-item">
                    <p className={`title is-flex ${styles.title}`}>
                        {this.renderName()}
                    </p>
                </div>

                <div className="is-spacer" />

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
                        <EditChannel close={ch => this.closeRename(ch)} />
                    </Modal>
                </Portal>

                {/* Modal for channel notification settings */}
                <Portal closeOnEsc onClose={() => this.closeNotifications()} isOpened={this.state.showNotifications}>
                    <Modal closeAction={() => this.closeNotifications()}>
                        <NotifySettings close={() => this.closeNotifications()} />
                    </Modal>
                </Portal>
            </nav>
        );
    }
}
