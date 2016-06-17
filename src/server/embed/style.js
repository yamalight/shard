export const style = `
html, body, body div, span, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, pre, abbr, address, cite, code,
del, dfn, em, img, ins, kbd, q, samp, small, strong, sub, sup, var, b, i, dl, dt, dd, ol, ul, li, fieldset, form,
label, legend, table, caption, tbody, tfoot, thead, tr, th, td, article, aside, figure, footer, header, menu, nav,
section, time, mark, audio, video, details, summary {
    margin: 0;
    padding: 0;
    border: 0;
    font-size: 100%;
    font-weight: normal;
    vertical-align: baseline;
    background: transparent;
}

article, aside, figure, footer, header, hgroup, section {
    display: block;
}

strong {
    color: #222324;
    font-weight: 700;
}

.media {
    align-items: flex-start;
    display: flex;
    text-align: left;
}

.media-left {
    margin-right: 10px;
    padding-left: 5px;
    border-left: solid 5px rgba(0, 0, 0, 0.2);
}

.image.is-64x64 {
    height: 64px;
    width: 64px;
}

.image {
    display: block;
    position: relative;
}

.image img {
    display: block;
    height: auto;
    width: 100%;
}

img {
    max-width: 100%;
}

.media-content {
    flex: 1;
    text-align: left;
}

.message-content {
    min-height: 67px;
    display: flex;
    flex-direction: column;
}

.message-header {
    display: flex;
    margin-bottom: 0.5em !important;
    align-items: center;
    min-height: 24px;
}
`;
