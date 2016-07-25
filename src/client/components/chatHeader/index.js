import _ from 'lodash';
import React from 'react';
import Portal from 'react-portal';
import shallowCompare from 'react-addons-shallow-compare';
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

export default class ChatHeader extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
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
                infobarType: s.infobarType,
                currentTeam: s.currentTeam ? s.currentTeam.id : undefined,
                currentChannelId: s.currentChannel ? s.currentChannel.id : undefined,
                currentChannelName: s.currentChannel ? s.currentChannel.name : undefined,
                currentChannelType: s.currentChannel ? s.currentChannel.type : undefined,
                menuItems: this.generateMenuItems(s),
            }))
            // set description sidebar
            .do(s => {
                if (s.infobarType !== 'sidebar' || s.menuItems.length === 0) {
                    return;
                }
                // try to find last used item
                const id = localStorage.getItem('shard.infobar');
                const item = s.menuItems.find(it => it.id === id);
                // if id or item is not valid - just use first item in list
                if (!id || !item) {
                    if (s.menuItems[0]) {
                        this.handleMenuItem(s.menuItems[0]);
                    }
                    return;
                }
                // set item
                this.handleMenuItem(item);
            })
            // store to state
            .subscribe(s => this.setState(s)),
        ];
    }
    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare({state: _.omit(this.state, ['menuItems'])}, undefined, _.omit(nextState, ['menuItems']));
    }
    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    }

    generateMenuItems(s) {
        if (!s.currentChannel || !s.currentTeam) {
            return [];
        }

        const items = [{
            id: 'description',
            title: 'Description',
            type: 'sidebar',
            content: () => <Description />,
        }, {
            title: 'Notification settings',
            type: 'action',
            content: () => this.setState({showNotifications: true}),
        }];

        // if it's private conversation - return
        if (s.currentTeam.id === meTeam.id) {
            return items.concat([{type: 'separator'}, ...sidebarExtensions]);
        }

        // otherwise add edit button
        return [
            ...items,
            {
                title: 'Edit channel',
                type: 'action',
                content: () => this.setState({showRename: true}),
            },
        ].concat([{type: 'separator'}, ...sidebarExtensions]);
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
        const {currentChannelName, currentChannelType, currentTeam} = this.state;

        if (currentTeam && currentChannelName) {
            return (
                <span className={`is-flex ${styles.channelName}`}>
                    <span className="icon">
                        <i className={`fa ${currentChannelType === 'conversation' ? 'fa-user' : 'fa-hashtag'}`} />
                    </span>
                    {currentChannelName}
                </span>
            );
        }

        if (currentTeam && currentTeam === meTeam.id) {
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

                {this.state.currentChannelId && (
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
                {this.state.showRename && (
                    <Portal closeOnEsc onClose={() => this.closeRename()} isOpened>
                        <Modal closeAction={() => this.closeRename()}>
                            <EditChannel close={ch => this.closeRename(ch)} />
                        </Modal>
                    </Portal>
                )}

                {/* Modal for channel notification settings */}
                {this.state.showNotifications && (
                    <Portal closeOnEsc onClose={() => this.closeNotifications()} isOpened>
                        <Modal closeAction={() => this.closeNotifications()}>
                            <NotifySettings close={() => this.closeNotifications()} />
                        </Modal>
                    </Portal>
                )}
            </nav>
        );
    }
}
