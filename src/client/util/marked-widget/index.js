import container from 'markdown-it-container';

const urlToSize = (url) => {
    if (url.indexOf('youtube.com') !== -1) {
        return {width: '560px', height: '315px'};
    }

    return {width: '100%', height: '100px'};
};

// plugin attachment
export default (m) => {
    const regex = /^widget=(.*)$/;

    // register widget
    m.use(container, 'widget', {
        validate(params) {
            return params.trim().match(regex);
        },

        render(tokens, idx) {
            const match = tokens[idx].info.trim().match(regex);

            if (tokens[idx].nesting === 1) {
                const url = match[1];
                const {width, height} = urlToSize(url);
                // opening tag
                return `<iframe src="${url}" width="${width}" height="${height}"`;
            }

            // closing tag
            return `></iframe>\n`;
        },

        marker: '%',
    });
};
