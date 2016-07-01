import container from 'markdown-it-container';

// loading handling
const handleWidgetLoad = (obj) => {
    try {
        // try to access internal body
        const scrollHeight = obj.contentWindow.document.body.scrollHeight; // eslint-disable-line
    } catch (e) {
        // if can't - just return
        return;
    }

    // set height to 0 to maximize scoll
    obj.style.minHeight = 0; // eslint-disable-line
    obj.style.height = 0; // eslint-disable-line
    // get scroll height
    const h = obj.contentWindow.document.body.scrollHeight;
    const height = `${h}px`;
    // set new height
    obj.style.height = height; // eslint-disable-line
    obj.style.minHeight = height; // eslint-disable-line
};
if (window.shardApp) {
    window.shardApp.handleWidgetLoad = handleWidgetLoad;
} else {
    window.shardApp = {handleWidgetLoad};
}

// plugin attachment
export default (m) => {
    // register widget
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
            return ` frameborder="0" scrolling="no" onload="window.shardApp.handleWidgetLoad(this)" />\n`;
        },

        marker: '%',
    });
};
