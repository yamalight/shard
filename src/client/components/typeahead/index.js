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

        this.state = {
            title: 'Typeahead title',
            shouldAppear: false,
            loading: false,
            results: [],
        };
    }

    componentWillMount() {
        this.subs = _.flatten(typeaheadExtensions
            .map(ex => [
                ex.results.subscribe(res => this.setState({results: res, loading: false})),
                ex.actions.subscribe(ctx => this.handleAction(ctx)),
            ])
            .concat([
                this.typeaheadSubject
                .debounce(300)
                .subscribe(d => this.getTypeahead(d)),
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
            loading: true,
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
        this.setState({shouldAppear: false, loading: false});
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
            <div className={`panel ${styles.typeahead}`}>
                <div className="panel-heading">
                    {this.state.title}
                </div>
                {this.state.loading && (
                    <div className="panel-block">
                        <a className="button is-loading is-fullwidth">
                            Loading...
                        </a>
                    </div>
                )}
                {!this.state.loading && this.state.results}
            </div>
        );
    }
}
