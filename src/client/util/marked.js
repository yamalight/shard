import {highlightAuto} from 'highlight.js';
import MarkdownIt from 'markdown-it';
import emoji from 'markdown-it-emoji';
import fontawesome from 'markdown-it-fontawesome';
import taskLists from 'markdown-it-task-lists';
import container from 'markdown-it-container';

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

export const markdown = (text) => m.render(text);
