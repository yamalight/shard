import React from 'react';
import {browserHistory} from 'react-router';
import {markdown} from '../../util';

const testMarkdown = `
# Hello world!

> test markdown

- [ ] one
- [ ] two

\`\`\`js
const some = 'javascript'.here;
\`\`\`

Normal image:
![alt text](https://github.com/adam-p/markdown-here/raw/master/src/common/images/icon48.png "Logo Title Text 1")

Emojis: :thumbsup: :tada:

Font-awesome: :fa-flag: :fa-gitlab:

Some more text with here.
And some more text after that just to see how it looks.

And here's a widget
%%% widget=https://www.youtube.com/embed/b3ADsUFJ46Y
`;

const NoMatch = () => (
    <section className="hero is-fullheight">
        <div className="hero-body">
            <div className="container">
                <div className="columns">
                    <div className="column is-one-third">
                        <h1 className="title">
                            Shard.
                        </h1>
                        <h2 className="subtitle">
                            Looks like you are lost.
                        </h2>

                        <a className="button" onClick={() => browserHistory.push('/channels/@me')}>
                            Go home
                        </a>
                    </div>
                    <div className="column">
                        <div dangerouslySetInnerHTML={{__html: markdown(testMarkdown)}} />
                    </div>
                </div>
            </div>
        </div>
    </section>
);

export default NoMatch;
