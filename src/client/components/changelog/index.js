import React from 'react';
// import styles from './joinchannel.css';
import {markdown} from '../../util';
import changelogMarkdown from '../../../../CHANGELOG.md';

export default () => (
    <div className="card is-fullwidth">
        <header className="card-header">
            <p className="card-header-title">
                Changelog
            </p>
        </header>
        <div className="card-content content" dangerouslySetInnerHTML={{__html: markdown(changelogMarkdown)}} />
    </div>
);
