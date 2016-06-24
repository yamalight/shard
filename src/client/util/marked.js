import _ from 'lodash';
import {highlightAuto} from 'highlight.js';
import MarkdownIt from 'markdown-it';
import emoji from 'markdown-it-emoji';
import fontawesome from 'markdown-it-fontawesome';
import taskLists from 'markdown-it-task-lists';
import container from 'markdown-it-container';

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
};

// init parser
const m = new MarkdownIt(mdOpt);
// add plugins
m.use(emoji);
m.use(fontawesome);
m.use(taskLists);
// widget support
m.use(container, 'widget', {
    validate(params) {
        return params.trim().match(/^widget=(.*)$/);
    },

    render(tokens, idx) {
        const match = tokens[idx].info.trim().match(/^widget=(.*)$/);

        if (tokens[idx].nesting === 1) {
            // opening tag
            return `<iframe class="widget" src="${match[1]}"`;
        }

        // closing tag
        return `/>\n`;
    },

    marker: '%',
});
// apply plugins from extensions
mdExtensions.forEach(p => m.use(p.plugin, p.options));

export const markdown = (text) => m.render(text);
