import React from 'react';
import {browserHistory} from 'react-router';
import styles from './home.css';
import store$, {registerUser, loginUser} from '../../store';

export default class Home extends React.Component {
    constructor(props) {
        super(props);

        const {query, state} = props.location;
        const {error: redirectError, relogin} = state || {};
        const {username} = query;
        const emailValid = query.emailValid === 'true';
        this.state = {
            username,
            emailValid,
            redirectError,
            showLogin: emailValid || relogin,
            showRegister: false,
        };
    }

    componentWillMount() {
        this.subs = [
            store$
            .map(state => state.filter((_, key) => [
                'authStatus',
                'registerError',
                'registerMessage',
                'authError',
                'user',
            ].includes(key)))
            .distinctUntilChanged()
            .map(s => s.toJS())
            .do(auth => this.checkAuth(auth))
            .subscribe(auth => this.setState(auth)),
        ];

        // clear history state and query to remove any old errors or messages
        browserHistory.push({query: {}, state: {}});
    }
    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    }

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
    }

    handleKeyPress(e) {
        if (e.key === 'Enter') {
            this.doAuth();
        }
    }

    doAuth() {
        const username = this.username.value;
        const password = this.password.value;
        if (this.state.showRegister) {
            const passwordRepeat = this.passwordRepeat.value;
            const email = this.email.value;
            if (password !== passwordRepeat) {
                this.setState({error: 'Passwords must match!'});
                return;
            }

            registerUser({username, password, email});
            return;
        }

        loginUser({username, password});
    }

    goHome() {
        const {location} = this.props;
        if (location.state && location.state.nextPathname) {
            browserHistory.push(location.state.nextPathname);
        } else {
            browserHistory.push('/channels/@me');
        }
    }

    checkAuth(auth) {
        if (auth.authStatus === 'loggedin') {
            this.goHome();
        }
    }

    renderInput() {
        if (this.state.user && this.state.user.username) {
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
                <p className="control has-icon">
                    <input
                        className="input"
                        type="text"
                        placeholder="Enter your username"
                        ref={(i) => { this.username = i; }}
                        defaultValue={this.state.username}
                    />
                    <i className="fa fa-user" />
                </p>
                {this.state.showRegister && (
                    <p className="control has-icon">
                        <input
                            className="input"
                            type="text"
                            placeholder="Enter your email for validation"
                            ref={(i) => { this.email = i; }}
                        />
                        <i className="fa fa-envelope" />
                    </p>
                )}
                <p className="control has-icon">
                    <input
                        className="input"
                        type="password"
                        placeholder="Enter your password"
                        ref={(i) => { this.password = i; }}
                        onKeyUp={() => this.validatePasswords()}
                        onKeyPress={e => this.handleKeyPress(e)}
                    />
                    <i className="fa fa-lock" />
                </p>
                {this.state.showRegister && (
                    <p className="control has-icon">
                        <input
                            className="input"
                            type="password"
                            placeholder="Repeat your password"
                            ref={(i) => { this.passwordRepeat = i; }}
                            onKeyUp={() => this.validatePasswords()}
                            onKeyPress={e => this.handleKeyPress(e)}
                        />
                        <i className="fa fa-lock" />
                    </p>
                )}
                {this.state.showRegister && this.state.registerMessage && (
                    <div className="notification is-success">
                        Registration successful!
                        <br />
                        {this.state.registerMessage.toString()}
                    </div>
                )}
                {this.state.showRegister && this.state.registerError && (
                    <div className="notification is-danger">
                        Error during registration!
                        <br />
                        {this.state.registerError.toString()}
                    </div>
                )}
                {this.state.authError && (
                    <div className="notification is-danger">
                        Error during authorization!
                        <br />
                        {this.state.authError.toString()}
                    </div>
                )}
                {this.state.error ? (
                    <div className="notification is-danger">
                        {this.state.error}
                    </div>
                ) : (
                    <div className="is-flex">
                        <a className="button is-success" onClick={() => this.doAuth()}>
                            {this.state.showRegister ? 'Register' : 'Login'}
                        </a>
                        <div className="is-spacer" />
                        <a
                            className="button"
                            onClick={() => this.setState({
                                showLogin: this.state.showRegister,
                                showRegister: !this.state.showRegister,
                            })}
                        >
                            {this.state.showRegister ? 'Let me login!' : 'I want to register!'}
                        </a>
                    </div>
                )}
            </div>
        );
    }

    render() {
        const {location} = this.props;

        return (
            <section className="hero is-fullheight">
                <div className="hero-body">
                    <div className="container">
                        {location.state && location.state.nextPathname && (
                            <div className="notification is-warning">
                                You need to login to access <code>{location.state.nextPathname}</code>!
                                Do it now and you'll be redirected to it upon success.
                            </div>
                        )}
                        {this.state.username && this.state.emailValid && (
                            <div className="notification is-success">
                                Your email is now validated and account is active!
                                You can now log in using the form below.
                            </div>
                        )}
                        {this.state.redirectError && (
                            <div className="notification is-danger">
                                {this.state.redirectError}
                            </div>
                        )}
                        <div className="columns">
                            <div className="column is-one-third">
                                <h1 className="title">
                                    Shard
                                </h1>
                                <h2 className={`subtitle ${styles.subtitle}`}>
                                    All-in-one community platform that's free, secure,
                                    and works on both your desktop and phone.
                                    Stop paying for Slack and hassling with external services.
                                    Simplify your life.
                                </h2>
                                <h2 className="subtitle">Communication redefined.</h2>

                                {this.renderInput()}
                            </div>
                            <div className="column">
                                <img
                                    src="/img/shard.png"
                                    alt="Shard screenshot"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}
