import React from 'react';
import ReactDOM from 'react-dom';
import styles from './dropdown.css';

const Dropdown = React.createClass({
    componentWillMount() {
        document.addEventListener('click', this.handleClick, false);
    },

    componentWillUnmount() {
        document.removeEventListener('click', this.handleClick, false);
    },

    handleClick(e) {
        if (ReactDOM.findDOMNode(this).contains(e.target)) {
            return;
        }

        this.props.onHide();
    },

    renderItem(it) {
        return <li key={it.title}><a onClick={() => this.props.onItem(it)}>{it.title}</a></li>;
    },

    render() {
        const {style, title, items, extItems} = this.props;

        return (
            <div className={`box ${styles.menu}`} style={style}>
                <div className="menu">
                    <p className="menu-label">{title}</p>
                    <ul className="menu-list">
                        {items.map(it => this.renderItem(it))}
                    </ul>
                    {extItems && (
                        <p className="menu-label">
                            Extensions
                        </p>
                    )}
                    {extItems && (
                        <ul className="menu-list">
                            {extItems.map(it => this.renderItem(it))}
                        </ul>
                    )}
                </div>
            </div>
        );
    },
});

export default Dropdown;
