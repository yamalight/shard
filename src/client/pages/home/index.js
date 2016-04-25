import React from 'react';
import {browserHistory} from 'react-router';
import styles from './home.css';
import store$, {registerUser, loginUser} from '../../store';

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
            .map(state => state.filter((_, key) => ['authStatus', 'registerError'].includes(key)))
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

    checkAuth(auth) {
        if (auth.authStatus === 'loggedin') {
            browserHistory.push('/channel/home');
        }
    },

    renderInput() {
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
            <div className="hero is-fullheight">
                <div className="hero-content">
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
                            <div className="column">
                                <img
                                    src="https://discordapp.com/assets/75821e7b35417974f6c9111165071a10.png"
                                    alt="Shard screenshot"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    },
});

export default Home;
