import React from 'react';
import {browserHistory} from 'react-router';
import styles from './home.css';
import store$, {registerUser} from '../../store';

const Home = React.createClass({
    getInitialState() {
        return {
            showInput: false,
        };
    },

    componentWillMount() {
        this.subs = [
            store$
            .map(state => state.filter((_, key) => ['authStatus', 'registerError'].includes(key)))
            .map(auth => auth.toJS())
            .subscribe(auth => this.setState(auth)),
        ];
    },
    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    },

    validatePasswords() {
        const password = this.password.value;
        const passwordRepeat = this.passwordRepeat.value;
        if (password !== passwordRepeat) {
            this.setState({error: 'Passwords must match!'});
        } else {
            this.setState({error: undefined});
        }
    },

    register() {
        const username = this.username.value;
        const password = this.password.value;
        const passwordRepeat = this.passwordRepeat.value;
        if (password !== passwordRepeat) {
            this.setState({error: 'Passwords must match!'});
        }
        registerUser({username, password});
        // browserHistory.push({
            // pathname: '/channel/home',
        // });
    },

    renderInput() {
        if (!this.state.showInput) {
            return (
                <a
                    className="button is-success is-large"
                    onClick={() => this.setState({showInput: true})}
                >
                    Try it now
                </a>
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
                <input
                    className="input"
                    type="password"
                    placeholder="Repeat your password"
                    ref={(i) => { this.passwordRepeat = i; }}
                    onKeyUp={() => this.validatePasswords()}
                />
                {this.state.registerError && (
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
                    <a className="button is-success" onClick={this.register}>Register</a>
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
                                    Shard. {this.state.authStatus}
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
