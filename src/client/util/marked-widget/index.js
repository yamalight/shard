import container from 'markdown-it-container';

// error handling
const handleWidgetError = (widget) => {
    // console.log('error in widget:', widget);
};
if (window.shardApp) {
    window.shardApp.handleWidgetError = handleWidgetError;
} else {
    window.shardApp = {handleWidgetError};
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
            return ` onerror="window.shardApp.handleWidgetError(this)" />\n`;
        },

        marker: '%',
    });
};
