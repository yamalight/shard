export const db = {
    host: process.env.EXYNIZE_DB_HOST || 'docker.dev',
    database: process.env.EXYNIZE_DB_NAME || 'sharddb',
    user: '',
    password: '',
};

export const jwtconf = {
    secret: 'default-jwt-secret',
};

export const auth = {
    salt: 'Jst#ULN9&HD!NZ0g',
};
