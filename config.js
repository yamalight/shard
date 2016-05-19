export const db = {
    host: process.env.EXYNIZE_DB_HOST || 'docker.dev',
    db: process.env.EXYNIZE_DB_NAME || 'sharddb',
    // user: '',
    // password: '',
};

export const jwtconf = {
    secret: 'default-jwt-secret',
};

export const auth = {
    salt: 'Jst#ULN9&HD!NZ0g',
};

export const socket = {
    pingTime: 30000, // 30s
};

// extensions
import userTypeahead from './src/extensions/userTypeahead/server';
import channelTypeahead from './src/extensions/channelTypeahead/server';

export const extensions = [
    ...userTypeahead,
    ...channelTypeahead,
];
