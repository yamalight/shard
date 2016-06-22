import React from 'react';
import ReactDOM from 'react-dom';
import styles from './dropdown.css';

export default class Dropdown extends React.Component {
    constructor(props) {
        super(props);

        this.clickHandler = this.handleClick.bind(this);
    }

    componentWillMount() {
        document.addEventListener('click', this.clickHandler, false);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.clickHandler, false);
    }

    handleClick(e) {
        if (ReactDOM.findDOMNode(this).contains(e.target)) {
            return;
        }

        this.props.onHide();
    }

    handleItemClick(it) {
        this.props.onItem(it);
        this.props.onHide();
    }

    renderItem(it, i) {
        if (it.type && it.type === 'separator') {
            return <li key={`separator_${i}`} className={styles.separator} />;
        }

        return <li key={it.title}><a onClick={() => this.handleItemClick(it)}>{it.title}</a></li>;
    }

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
                            {extItems.map((it, i) => this.renderItem(it, i))}
                        </ul>
                    )}
                </div>
            </div>
        );
    }
}
