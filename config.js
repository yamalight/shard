import _ from 'lodash';

export const db = {
    host: process.env.SHARD_DB_HOST || 'docker.dev',
    db: process.env.SHARD_DB_NAME || 'sharddb',
};

export const requireEmailValidation = process.env.SHARD_MAIL_VALIDATION ?
    process.env.SHARD_MAIL_VALIDATION === '1' : true;

export const email = {
    host: process.env.SHARD_MAIL_HOST || 'mail.gandi.net',
    port: process.env.SHARD_MAIL_PORT || 465,
    secure: process.env.SHARD_MAIL_SECURE,
    auth: {
        user: process.env.SHARD_MAIL_USER || 'bot@shard.chat',
        pass: process.env.SHARD_MAIL_PASS || 'ovbrlhKyyiEVdB5G',
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

// extensions
import userTypeahead from './src/extensions/userTypeahead/server';
import channelTypeahead from './src/extensions/channelTypeahead/server';

export const extensions = _.flatten([
    userTypeahead,
    channelTypeahead,
]);
