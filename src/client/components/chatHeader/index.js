import React from 'react';
import styles from './chat.css';

// components
import Description from '../description';
import Dropdown from '../dropdown';

// store and actions
import store$, {setInfobar} from '../../store';

export default class Chat extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentChannel: {},
        };
    }

    componentWillMount() {
        this.subs = [
            // get initial data
            store$
            .map(s => s.filter((v, key) => ['currentChannel'].includes(key)))
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
            content: <Description />,
        }];
    }

    showMenu() {
        this.setState({showMenu: true});
    }
    handleMenuItem(item) {
        setInfobar(item);
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

                <div className={`navbar-item is-flex ${styles.navMenu}`}>
                    <a className="card-header-icon" onClick={() => this.showMenu()}>
                        <i className="fa fa-angle-down" />
                    </a>
                </div>

                {this.state.showMenu && (
                    <Dropdown
                        style={{top: 50, right: 5}}
                        title="Channel"
                        items={this.state.menuItems}
                        onItem={it => this.handleMenuItem(it)}
                        onHide={() => this.closeMenu()}
                    />
                )}
            </nav>
        );
    }
}
