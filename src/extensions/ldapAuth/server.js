// npm packages
import LDAP from 'ldap-client';

// our packages
import LdapAuth from './base';

class LdapAuthServer extends LdapAuth {
    type = 'auth'

    constructor({config, db, util}) {
        super();

        const {logger} = util;
        this.db = db;
        this.util = util;
        this.logger = logger;

        this.ldapConfig = config.ldap;
        this.connectPromise = new Promise((resolve, reject) => {
            if (!this.ldapConfig.enabled) {
                reject({error: 'LDAP not enabled!'});
                return;
            }

            this.ldap = new LDAP(this.ldapConfig.connectConfig, err => {
                if (err) {
                    this.logger.error('[LDAP] error connecting:', err);
                    reject(err);
                    return;
                }

                // connected and ready
                this.logger.debug('[LDAP] connected and ready');
                this.ldap.bind(this.ldapConfig.bindConfig, e => {
                    if (e) {
                        this.logger.error('[LDAP] error binding:', e);
                        reject(e);
                        return;
                    }

                    this.logger.debug('[LDAP] bound successfully!');
                    resolve();
                });
            });
        });
    }

    login({username, password}) {
        return new Promise((resolve, reject) => {
            const query = {
                filter: `(uid=${username})`,
                password,
            };
            this.logger.debug('[LDAP] searching with:', query);
            // try to search
            this.ldap.findandbind(query, async (searchErr, data) => {
                if (searchErr) {
                    this.logger.error('[LDAP] search error:', searchErr);
                    reject(searchErr);
                    return;
                }

                this.logger.debug('[LDAP] search success!');
                const hashedPassword = this.util.hash(password);

                // try to find user in local db
                const existingUsers = await this.db.User.filter({username, password: hashedPassword})
                    .without(['password', 'verifyId', 'subscriptions', 'passwordReset'])
                    .limit(1)
                    .execute();
                const existingUser = existingUsers.pop();
                if (existingUser) {
                    this.logger.info('[LDAP] user already in db:', existingUser);
                    resolve(existingUser);
                    return;
                }

                // create new user object
                const userData = {
                    username,
                    password: hashedPassword,
                    email: data.mail[0],
                    isEmailValid: true,
                };
                this.logger.debug('[LDAP] creating new user:', userData);

                // save to db
                let user;
                try {
                    user = await this.db.User.save(userData);
                } catch (e) {
                    this.logger.error('[LDAP] error saving user:', e);
                    reject(e);
                    return;
                }

                if (!user) {
                    this.logger.error('[LDAP] unknown error while creating user during LDAP auth!');
                    reject(new Error('Error while creating user!'));
                    return;
                }

                // if autojoin is set - join to team and channel
                const {team, channel} = this.ldapConfig.autojoin || {};

                if (team && team.length > 0) {
                    await this.util.api.team.addToTeam({teamId: team, userId: user.id});
                    this.logger.debug('[LDAP] auto-added user to team');
                }

                if (channel && channel.length > 0) {
                    await this.util.api.channel.addToChannel({channelId: channel, userId: user.id});
                    this.logger.debug('[LDAP] auto-added user to channel');
                }

                this.logger.info('[LDAP] user created:', user);
                resolve(user);
            });
        });
    }

    authenticate({username, password}) {
        return this.connectPromise
            .then(() => this.login({username, password}))
            .then(user => ({user}))
            .catch(e => ({error: e.toString()}));
    }
}

export default [LdapAuthServer];
