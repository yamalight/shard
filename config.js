import _ from 'lodash';

export const db = {
    host: process.env.SHARD_DB_HOST || 'docker.dev',
    db: process.env.SHARD_DB_NAME || 'sharddb',
    timeoutError: process.env.SHARD_DB_TIMEOUT || 1000,
    pingInterval: process.env.SHARD_DB_PINGINTERVAL || 60,
};

export const requireEmailValidation = process.env.SHARD_MAIL_VALIDATION ?
    process.env.SHARD_MAIL_VALIDATION === '1' : true;

export const email = {
    host: process.env.SHARD_MAIL_HOST || 'mail.server.net',
    port: process.env.SHARD_MAIL_PORT || 465,
    secure: process.env.SHARD_MAIL_SECURE,
    auth: {
        user: process.env.SHARD_MAIL_USER || 'email@server.net',
        pass: process.env.SHARD_MAIL_PASS || 'password',
    },
};

export const jwtconf = {
    secret: process.env.SHARD_JWT_SECRET || 'default-jwt-secret',
};

export const auth = {
    salt: process.env.SHARD_AUTH_SALT || 'Jst#ULN9&HD!NZ0g',
};

export const socket = {
    pingTime: process.env.SHARD_SOCKET_PINGTIME || 30000, // 30s
};

export const webPush = {
    gcmKey: process.env.SHARD_GCM_KEY || 'your gcm key here',
    gcmId: process.env.SHARD_GCM_ID || 'your gcm app id/number here',
};

export const ldap = {
    enabled: process.env.SHARD_LDAP_ENABLED || false,
    connectConfig: {
        uri: process.env.SHARD_LDAP_URI || 'ldap://your.ldap.server.org', // string
        validatecert: process.env.SHARD_LDAP_VALIDATECERT || false, // Verify server certificate
        connecttimeout: process.env.SHARD_LDAP_TIMEOUT || -1, // connect timeout in seconds, -1 is infinite timeout
        base: process.env.SHARD_LDAP_BASE || 'dc=org', // default base for all future searches
        // attrs: process.env.SHARD_LDAP_ATTRS || '*', // default attribute list for future searches
        // filter: process.env.SHARD_LDAP_FILTER || '(objectClass=*)', // default filter for all future searches
        // scope: process.env.SHARD_LDAP_SCOPE || -1, // default scope for all future searches
    },
    bindConfig: {
        binddn: process.env.SHARD_LDAP_BINDDN || 'dc=org',
        password: process.env.SHARD_LDAP_PASSWORD || 'your-pass',
    },
    autojoin: {
        team: process.env.SHARD_LDAP_AUTOJOIN_TEAM || '',
        channel: process.env.SHARD_LDAP_AUTOJOIN_CHANNEL || '',
    },
};

// extensions
import userTypeahead from './src/extensions/userTypeahead/server';
import channelTypeahead from './src/extensions/channelTypeahead/server';
import slashCommands from './src/extensions/slashCommands/server';
import usersSidebar from './src/extensions/usersSidebar/server';
import calendarSidebar from './src/extensions/calendarSidebar/server';
import trelloSidebar from './src/extensions/trelloSidebar/server';
import ldapAuth from './src/extensions/ldapAuth/server';

export const extensions = _.flatten([
    userTypeahead,
    channelTypeahead,
    slashCommands,
    usersSidebar,
    calendarSidebar,
    trelloSidebar,
    ldapAuth,
]);
