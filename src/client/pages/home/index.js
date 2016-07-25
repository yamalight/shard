import React from 'react';
import {browserHistory} from 'react-router';
import Portal from 'react-portal';
import styles from './home.css';

// components
import Modal from '../../components/modal';
import ResetPassword from '../../components/resetpassword';

// store and actions
import store$, {registerUser, loginUser} from '../../store';

export default class Home extends React.Component {
    constructor(props) {
        super(props);

        const {query, state} = props.location;
        const {error: redirectError, relogin} = state || {};
        const {username} = query;
        const emailValid = query.emailValid === 'true';
        const passReset = query.passwordReset === 'true';
        this.state = {
            username,
            emailValid,
            passReset,
            redirectError,
            showLogin: emailValid || relogin || passReset,
            showRegister: false,
            showPasswordReset: false,
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
                'passresetMessage',
            ].includes(key)))
            .distinctUntilChanged()
            .map(s => s.toJS())
            .do(auth => this.checkAuth(auth))
            .subscribe(auth => this.setState(auth)),
        ];

        // clear history state and query to remove any old errors or messages
        browserHistory.push({query: {}, state: {}});
    }

    componentDidUpdate() {
        // focus on username input if needed
        if ((this.state.showLogin || this.state.showRegister) && this.username && this.username.value.length === 0) {
            this.username.focus();
        }
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
        // clear old errors
        store$.clear({authError: null, registerError: null});

        // check if registration
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

        // get remeberme checkbox
        const remember = this.remember.checked;

        loginUser({username, password, remember});
    }

    goHome() {
        const {location} = this.props;
        if (location.state && location.state.nextPathname) {
            browserHistory.push(location.state.nextPathname);
        } else {
            browserHistory.push('/channels/me');
        }
    }

    checkAuth(auth) {
        if (auth.authStatus === 'loggedin') {
            this.goHome();
        }
    }

    showRegister() {
        store$.clear({authError: null, registerError: null});
        this.setState({showRegister: true});
    }

    showLogin() {
        store$.clear({authError: null, registerError: null});
        this.setState({showLogin: true});
    }

    toggleRegisterLogin() {
        store$.clear({authError: null, registerError: null});
        this.setState({
            showLogin: this.state.showRegister,
            showRegister: !this.state.showRegister,
        });
    }

    closePassReset() {
        this.setState({showPasswordReset: false});
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
                        onClick={() => this.showRegister()}
                    >
                        Try it now
                    </a>
                    <br />
                    <a
                        className="button is-link"
                        onClick={() => this.showLogin()}
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
                {!this.state.showRegister && (
                    <p className="control">
                        <label className="checkbox">
                            <input type="checkbox" ref={c => { this.remember = c; }} /> Remember me
                        </label>
                    </p>
                )}
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
                            onClick={() => this.toggleRegisterLogin()}
                        >
                            {this.state.showRegister ? 'Let me login!' : 'I want to register!'}
                        </a>
                    </div>
                )}
                {!this.state.error && !this.state.showRegister && (
                    <div className={`is-flex ${styles.forgotPassword}`}>
                        <a className="button is-link" onClick={() => this.setState({showPasswordReset: true})}>
                            Help, I forgot my password!
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
                        {this.state.username && this.state.passReset && (
                            <div className="notification is-success">
                                Your password has been reset!
                                You can now log in using the form below.
                            </div>
                        )}
                        {this.state.passresetMessage && (
                            <div className="notification is-success">
                                Your password has been reset! {this.state.passresetMessage}
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

                {/* Modal for password recovery */}
                {this.state.showPasswordReset && (
                    <Portal closeOnEsc isOpened onClose={() => this.closePassReset()}>
                        <Modal closeAction={() => this.closePassReset()}>
                            <ResetPassword close={() => this.closePassReset()} />
                        </Modal>
                    </Portal>
                )}
            </section>
        );
    }
}
