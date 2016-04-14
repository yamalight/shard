import {highlightAuto} from 'highlight.js';
import marked from 'marked';

const renderer = new marked.Renderer();
renderer.listitem = function(text) {
    if (/^\s*\[[x ]\]\s*/.test(text)) {
        const formatted = text.replace(/^\s*\[ \]\s*/, '<input type="checkbox" /> ')
            .replace(/^\s*\[x\]\s*/, '<input type="checkbox" checked /> ');
        return `<li style="list-style: none">${formatted}</li>`;
    }

    return `<li>${text}</li>`;
};

const markedOptions = {
    renderer,
    highlight: (code) => highlightAuto(code).value,
    gfm: true,
    breaks: true,
    sanitize: true,
};

export default (text) => marked(text, markedOptions);
