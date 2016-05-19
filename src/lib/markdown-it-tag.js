/* eslint no-param-reassign: 0 */
const isLinkOpen = (str) => /^<a[>\s]/i.test(str);
const isLinkClose = (str) => /^<\/a\s*>/i.test(str);

export default (md, {
    preceding = '^|\\s',
    tagRegExp = '\\w+',
    tagSymbol = '#',
    urlPrefix = '/tag/',
} = {}) => {
    const {arrayReplaceAt, escapeHtml} = md.utils;

    const tagopen = (tokens, idx) => `<a href="${urlPrefix}${tokens[idx].content}">`;
    const tagclose = () => '</a>';
    const tagtext = (tokens, idx) => `${tagSymbol}${tokens[idx].content}`;

    const regex = new RegExp(`(${preceding})${tagSymbol}(${tagRegExp})`, 'g');

    const tag = (state) => {
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
                    const tagName = matches[m].split(tagSymbol, 2)[1];

                    // find the beginning of the matched text
                    let pos = text.indexOf(matches[m]);
                    // find the beginning of the attag
                    pos = text.indexOf(`${tagSymbol}${tagName}`, pos);

                    if (pos > 0) {
                        const token = new Token('text', '', 0);
                        token.content = text.slice(0, pos);
                        token.level = level;
                        nodes.push(token);
                    }

                    let token = new Token(`${tagSymbol}tagopen`, '', 1);
                    token.content = tagName;
                    token.level = level++;
                    nodes.push(token);

                    token = new Token(`${tagSymbol}tagtext`, '', 0);
                    token.content = escapeHtml(tagName);
                    token.level = level;
                    nodes.push(token);

                    token = new Token(`${tagSymbol}tagclose`, '', -1);
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

    md.core.ruler.after('inline', 'tag', tag);
    md.renderer.rules[`${tagSymbol}tagopen`] = tagopen;
    md.renderer.rules[`${tagSymbol}tagtext`] = tagtext;
    md.renderer.rules[`${tagSymbol}tagclose`] = tagclose;
};
