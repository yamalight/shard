import React from 'react';
import {render} from 'react-dom';
import {Router, Route, browserHistory} from 'react-router';

// enable why-did-you-update if not in production
// if (process.env.NODE_ENV !== 'production') {
    // const whyDidYouUpdate = require('why-did-you-update').whyDidYouUpdate; // eslint-disable-line
    // whyDidYouUpdate(React, {exclude: /^(CommandPalette|Teambar|ChatHeader|ChatInput|Typeahead|Infobar)/});
// }

// global styles
import 'font-awesome/css/font-awesome.min.css';
import './style/style.scss';

// app wrapper
import App from './app';

// routes
import routes from './routes';

// extensions support
import './extensions';

// service worker
import './worker/index.js';

// render app
render((
    <Router history={browserHistory}>
        <Route path="/" component={App}>
            {routes}
        </Route>
    </Router>
), document.getElementById('container'));
