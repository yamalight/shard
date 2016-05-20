import React from 'react';
import {IndexRoute, Route} from 'react-router';
import {requireAuth} from './util';

// pages
import Home from './pages/home';
import Main from './pages/main';
import Join from './pages/join';
import NoMatch from './pages/nomatch';

export default [
    <IndexRoute key="home" name="home" component={Home} />,
    <Route key="channels" name="channels" path="/channels/:team(/:channel)" component={Main} onEnter={requireAuth} />,
    <Route key="join" name="join" path="/join/:team(/:channel)" component={Join} onEnter={requireAuth} />,
    <Route key="nomatch" path="*" component={NoMatch} />,
];
