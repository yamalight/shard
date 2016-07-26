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
// widget support
const regex = /^widget=(.*)$/;
const urlToSize = (url) => {
    if (url.indexOf('youtube.com') !== -1) {
        return {width: '560px', height: '315px'};
    }

    return {width: '100%', height: '100px'};
};
// register widget
m.use(container, 'widget', {
    validate(params) {
        return params.trim().match(regex);
    },

    render(tokens, idx) {
        const match = tokens[idx].info.trim().match(regex);

        if (tokens[idx].nesting === 1) {
            const widget = match[1];
            const parts = widget.split(' ');
            const url = parts[0];
            const presetWidth = parts[1] ? parts[1].split('=')[1] : undefined;
            const presetHeight = parts[2] ? parts[2].split('=')[1] : undefined;
            const computedSize = urlToSize(url);
            const width = presetWidth || computedSize.width;
            const height = presetHeight || computedSize.height;
            // opening tag
            return `<iframe src="${url}" width="${width}" height="${height}"`;
        }

        // closing tag
        return `></iframe>\n`;
    },

    marker: '%',
});

export const markdown = (text) => m.render(text);
