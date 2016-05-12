import React from 'react';
import {browserHistory} from 'react-router';
import styles from './home.css';
import store$, {registerUser, loginUser} from '../../store';

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

Custom widget:
%[My Image](http://example.com/img.jpg)

Emojis: :thumbsup: :tada:

Font-awesome: :fa-flag: :fa-gitlab:

Some more text with here.
And some more text after that just to see how it looks.

And here's a widget
%%% widget=https://www.youtube.com/embed/b3ADsUFJ46Y
`;

const Home = React.createClass({
    getInitialState() {
        return {
            showLogin: false,
            showRegister: false,
        };
    },

    componentWillMount() {
        this.subs = [
            store$
            .map(state => state.filter((_, key) => ['authStatus', 'registerError', 'user'].includes(key)))
            .map(auth => auth.toJS())
            .do(auth => this.checkAuth(auth))
            .subscribe(auth => this.setState(auth)),
        ];
    },
    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    },

    validatePasswords() {
        if (!this.state.showRegister) {
            return;
        }

        const password = this.password.value;
        const passwordRepeat = this.passwordRepeat.value;
        if (password !== passwordRepeat) {
            this.setState({error: 'Passwords must match!'});
        } else {
            this.setState({error: undefined});
        }
    },

    doAuth() {
        const username = this.username.value;
        const password = this.password.value;
        if (this.state.showRegister) {
            const passwordRepeat = this.passwordRepeat.value;
            if (password !== passwordRepeat) {
                this.setState({error: 'Passwords must match!'});
                return;
            }

            registerUser({username, password});
            return;
        }

        loginUser({username, password});
    },

    goHome() {
        browserHistory.push('/channel/home');
    },

    checkAuth(auth) {
        if (auth.authStatus === 'loggedin') {
            this.goHome();
        }
    },

    renderInput() {
        if (this.state.user.username) {
            return (
                <div className="has-text-centered">
                    <a
                        className="button is-success is-large"
                        onClick={() => this.goHome()}
                    >
                        Continue
                    </a>
                </div>
            );
        }

        if (!this.state.showRegister && !this.state.showLogin) {
            return (
                <div className="has-text-centered">
                    <a
                        className="button is-success is-large"
                        onClick={() => this.setState({showRegister: true})}
                    >
                        Try it now
                    </a>
                    <br />
                    <a
                        className="button is-link"
                        onClick={() => this.setState({showLogin: true})}
                    >
                        I already have an account..
                    </a>
                </div>
            );
        }

        return (
            <div>
                <input
                    className="input"
                    type="text"
                    placeholder="Enter your username"
                    ref={(i) => { this.username = i; }}
                />
                <input
                    className="input"
                    type="password"
                    placeholder="Enter your password"
                    ref={(i) => { this.password = i; }}
                    onKeyUp={() => this.validatePasswords()}
                />
                {this.state.showRegister && (
                    <input
                        className="input"
                        type="password"
                        placeholder="Repeat your password"
                        ref={(i) => { this.passwordRepeat = i; }}
                        onKeyUp={() => this.validatePasswords()}
                    />
                )}
                {this.state.showRegister && this.state.registerError && (
                    <div className="notification is-danger">
                        Error during registration!
                        <br />
                        {this.state.registerError.toString()}
                    </div>
                )}
                {this.state.error ? (
                    <div className="notification is-danger">
                        {this.state.error}
                    </div>
                ) : (
                    <a className="button is-success" onClick={this.doAuth}>
                        {this.state.showRegister ? 'Register' : 'Login'}
                    </a>
                )}
            </div>
        );
    },

    render() {
        return (
            <section className="hero is-fullheight">
                <div className="hero-body">
                    <div className="container">
                        <div className="columns">
                            <div className="column is-one-third">
                                <h1 className="title">
                                    Shard.
                                </h1>
                                <h2 className={`subtitle ${styles.subtitle}`}>
                                    All-in-one community platform that's free, secure,
                                    and works on both your desktop and phone.
                                    Stop paying for Slack and hassling with external services.
                                    Simplify your life.
                                </h2>
                                <h2 className="subtitle">You'll never go back.</h2>

                                {this.renderInput()}
                            </div>
                            <div
                                className="column"
                                onClick={() => this.setState({showMarkdown: !this.state.showMarkdown})}
                            >
                            {!this.state.showMarkdown && (
                                <img
                                    src="https://discordapp.com/assets/75821e7b35417974f6c9111165071a10.png"
                                    alt="Shard screenshot"
                                />
                            )}
                            {this.state.showMarkdown && (
                                <div dangerouslySetInnerHTML={{__html: markdown(testMarkdown)}} />
                            )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    },
});

export default Home;
