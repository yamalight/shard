/* eslint no-param-reassign: 0 */

const atopen = (tokens, idx) =>
    `<a href="/user/${tokens[idx].content.toLowerCase()}">`;
const atclose = () => '</a>';
const attext = (tokens, idx) => `@${tokens[idx].content}`;

const isLinkOpen = (str) => /^<a[>\s]/i.test(str);
const isLinkClose = (str) => /^<\/a\s*>/i.test(str);

export default (md, options) => {
    const arrayReplaceAt = md.utils.arrayReplaceAt;
    const escapeHtml = md.utils.escapeHtml;
    let attagRegExp = '\\w+';
    let preceding = '^|\\s';

    if (options) {
        if (typeof options.preceding !== 'undefined') {
            preceding = options.preceding;
        }
        if (typeof options.attagRegExp !== 'undefined') {
            attagRegExp = options.attagRegExp;
        }
    }

    const regex = new RegExp(`(${preceding})@(${attagRegExp})`, 'g');


    const attag = (state) => {
        const Token = state.Token;
        const blockTokens = state.tokens;

        for (let j = 0, l = blockTokens.length; j < l; j++) {
            if (blockTokens[j].type !== 'inline') {
                continue;
            }

            let tokens = blockTokens[j].children;

            let htmlLinkLevel = 0;

            for (let i = tokens.length - 1; i >= 0; i--) {
                const currentToken = tokens[i];

                // skip content of markdown links
                if (currentToken.type === 'link_close') {
                    i--;
                    while (tokens[i].level !== currentToken.level && tokens[i].type !== 'link_open') {
                        i--;
                    }
                    continue;
                }

                // skip content of html links
                if (currentToken.type === 'html_inline') {
                    // we are going backwards, so isLinkOpen shows end of link
                    if (isLinkOpen(currentToken.content) && htmlLinkLevel > 0) {
                        htmlLinkLevel--;
                    }
                    if (isLinkClose(currentToken.content)) {
                        htmlLinkLevel++;
                    }
                }
                if (htmlLinkLevel > 0) {
                    continue;
                }

                if (currentToken.type !== 'text') {
                    continue;
                }

                // find attags
                let text = currentToken.content;
                const matches = text.match(regex);

                if (matches === null) {
                    continue;
                }

                const nodes = [];
                let level = currentToken.level;

                for (let m = 0; m < matches.length; m++) {
                    const tagName = matches[m].split('@', 2)[1];

                    // find the beginning of the matched text
                    let pos = text.indexOf(matches[m]);
                    // find the beginning of the attag
                    pos = text.indexOf(`@${tagName}`, pos);

                    if (pos > 0) {
                        const token = new Token('text', '', 0);
                        token.content = text.slice(0, pos);
                        token.level = level;
                        nodes.push(token);
                    }

                    let token = new Token('atopen', '', 1);
                    token.content = tagName;
                    token.level = level++;
                    nodes.push(token);

                    token = new Token('attext', '', 0);
                    token.content = escapeHtml(tagName);
                    token.level = level;
                    nodes.push(token);

                    token = new Token('atclose', '', -1);
                    token.level = --level;
                    nodes.push(token);

                    text = text.slice(pos + 1 + tagName.length);
                }

                if (text.length > 0) {
                    const token = new Token('text', '', 0);
                    token.content = text;
                    token.level = level;
                    nodes.push(token);
                }

                // replace current node
                blockTokens[j].children = tokens = arrayReplaceAt(tokens, i, nodes);
            }
        }
    };

    md.core.ruler.after('inline', 'attag', attag);
    md.renderer.rules.atopen = atopen;
    md.renderer.rules.attext = attext;
    md.renderer.rules.atclose = atclose;
};
