import React from 'react';
import {IndexRoute, Route} from 'react-router';

// pages
import Home from './pages/home';
import Main from './pages/main';

export default [
    <IndexRoute key="home" name="home" component={Home} />,
    <Route key="channels" name="channels" path="/channels/:team(/:channel)" component={Main} />,
];
