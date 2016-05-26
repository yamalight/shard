import _ from 'lodash';
import {Subject} from 'rx';
import React from 'react';
import styles from './typeahead.css';
import {extensions} from '../../extensions';

// get typeahead extensions
const typeaheadExtensions = extensions.filter(ex => ex.type === 'typeahead');

// react component
export default class Typeahead extends React.Component {
    constructor(props) {
        super(props);

        this.typeaheadSubject = new Subject();
        this.actionSubject = props.action;

        this.state = {
            title: 'Typeahead title',
            shouldAppear: false,
            results: [],
        };
    }

    componentWillMount() {
        this.subs = _.flatten(typeaheadExtensions
            .map(ex => [
                ex.results.subscribe(res => this.setState({results: res, selectedIndex: 0})),
                ex.actions.subscribe(ctx => this.handleAction(ctx)),
            ])
            .concat([
                // typeahead input handler
                this.typeaheadSubject
                .debounce(300)
                .distinctUntilChanged()
                .subscribe(d => this.getTypeahead(d)),

                // up-down action key handler
                this.actionSubject
                .filter(key => key === 'ArrowUp' || key === 'ArrowDown')
                .map(key => (key === 'ArrowUp' ? -1 : 1))
                .subscribe(inc => {
                    const currentIndex = this.state.selectedIndex;
                    let selectedIndex = currentIndex + inc;
                    if (selectedIndex >= this.state.results.length) {
                        selectedIndex = 0;
                    }
                    if (selectedIndex < 0) {
                        selectedIndex = this.state.results.length - 1;
                    }
                    this.setState({selectedIndex});
                }),

                // enter action key handler
                this.actionSubject
                .filter(key => key === 'Enter')
                .subscribe(() => {
                    const {selectedIndex, results} = this.state;
                    const item = results[selectedIndex];
                    item.props.onClick.call(item);
                }),
            ]));
    }

    componentWillReceiveProps({text, currentTeam, currentChannel}) {
        this.typeaheadSubject.onNext({text, currentTeam, currentChannel});
    }

    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    }

    getTypeahead({text, currentTeam, currentChannel}) {
        const extension = typeaheadExtensions.find(ex => ex.check(text));

        // if no extension found - hide
        if (!extension) {
            this.hide();
            return;
        }

        // show box
        this.setState({
            shouldAppear: true,
            title: extension.title,
        });

        // get
        const context = {
            text,
            currentTeam: currentTeam.id,
            currentChannel: currentChannel.id,
        };
        extension.get(context);
    }

    hide() {
        this.setState({shouldAppear: false});
    }

    handleAction({typeahead, search}) {
        // console.log('handle action:', typeahead, search);
        const parts = this.props.input.value.split(' ');
        const last = parts.length - 1;
        parts[last] = parts[last].replace(search, `${typeahead} `);
        this.props.input.value = parts.join(' ');
        this.props.input.focus();
        this.hide();
    }

    render() {
        if (!this.state.shouldAppear) {
            return <span />;
        }

        return (
            <div className={styles.typeahead}>
                <div className="panel-heading">
                    {this.state.title}
                </div>
                {this.state.results.map((res, i) => React.cloneElement(res, {
                    className: `panel-block typeahead-item ${i === this.state.selectedIndex ? styles.active : ''}`,
                }))}
            </div>
        );
    }
}
