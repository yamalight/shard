import _ from 'lodash';
import {highlightAuto} from 'highlight.js';
import MarkdownIt from 'markdown-it';
import emoji from 'markdown-it-emoji';
import fontawesome from 'markdown-it-fontawesome';
import taskLists from 'markdown-it-task-lists';
// custom plugins
import initWidgets from './marked-widget';

// import extensions
import {extensions} from '../extensions';
// get extensions that has markdown plugins
const mdExtensions = _.flatten(
    extensions
    .filter(ex => ex.markdownPlugins && ex.markdownPlugins.length)
    .map(ex => ex.markdownPlugins)
);

// marked options
const mdOpt = {
    highlight: (code) => highlightAuto(code).value,
    breaks: true,
    linkify: true,
    typographer: true,
    html: true,
};

// init parser
const m = new MarkdownIt(mdOpt);
// add plugins
m.use(emoji);
m.use(fontawesome);
m.use(taskLists);
// widgets support
initWidgets(m);
// apply plugins from extensions
mdExtensions.forEach(p => m.use(p.plugin, p.options));

export const markdown = (text) => m.render(text);
