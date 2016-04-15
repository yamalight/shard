import React from 'react';
import {browserHistory} from 'react-router';
import styles from './home.css';

const Home = React.createClass({
    getInitialState() {
        return {
            showInput: false,
        };
    },

    initGuest() {
        // const username = this._input.value;
        browserHistory.push({
            pathname: '/channel/home',
        });
    },

    renderInput() {
        if (!this.state.showInput) {
            return (
                <a className="button is-success is-large"
                    onClick={() => this.setState({showInput: true})}
                >
                    Try it now
                </a>
            );
        }

        return (
            <p className="control has-addons">
                <input
                    className="input"
                    type="text"
                    placeholder="Enter your username"
                    ref={(i) => {this._input = i;}}
                />
                <a className="button is-success" onClick={this.initGuest}>Go</a>
            </p>
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
                                <img src="https://discordapp.com/assets/75821e7b35417974f6c9111165071a10.png"
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
