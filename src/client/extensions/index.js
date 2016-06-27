// import util
import store$, * as storeActions from '../store';
import * as util from '../util';
import Rx from 'rx';
import React from 'react';
// import extensions
import {extensions as extensionsList} from '../../../config.client';

// create global scope to store shared configs
if (window.shardApp) {
    window.shardApp.slashCommands = {};
} else {
    window.shardApp = {
        slashCommands: {},
    };
}

// load extensions
export const extensions = extensionsList.map(Ex => new Ex({
    ...util,
    Rx,
    React,
    store$,
    storeActions,
}));
