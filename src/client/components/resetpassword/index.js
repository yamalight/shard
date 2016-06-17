import React from 'react';
// import styles from './resetpassword.css';
import store$, {resetPassword} from '../../store';

export default class ResetPassword extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            passresetError: undefined,
            passresetMessage: undefined,
        };
    }

    componentWillMount() {
        this.subs = [
            store$
            .map(s => s.filter((_, key) => ['passresetError', 'passresetMessage'].includes(key)))
            .distinctUntilChanged(d => d, (a, b) => a.equals(b))
            .map(s => s.toJS())
            .do(s => s.passresetMessage && this.close())
            .subscribe(s => this.setState(s)),
        ];
    }
    componentWillUnmount() {
        this.subs.map(s => s.dispose());
    }

    handleKey(e) {
        if (e.key === 'Enter') {
            this.reset();
        }
    }

    reset() {
        const email = this._passResetEmail.value;

        // do not reset empty emails
        if (!email || !email.length) {
            return;
        }

        resetPassword({email});
    }
    close() {
        this.props.close();
    }

    render() {
        return (
            <div className="card is-fullwidth">
                <header className="card-header">
                    <p className="card-header-title">
                        Password reset
                    </p>
                </header>
                <div className="card-content">
                    {this.state.passresetError && (
                        <div className="notification is-danger">
                            Error during password reset!
                            <br />
                            {this.state.passresetError.toString()}
                        </div>
                    )}
                    <p className="control">
                        <input
                            className="input is-medium"
                            type="text"
                            placeholder="Email"
                            ref={t => { this._passResetEmail = t; }}
                            onKeyPress={e => this.handleKey(e)}
                        />
                    </p>
                </div>
                <footer className="card-footer">
                    <a className="card-footer-item" onClick={() => this.reset()}>Reset</a>
                    <a className="card-footer-item" onClick={() => this.close()}>Cancel</a>
                </footer>
            </div>
        );
    }
}
