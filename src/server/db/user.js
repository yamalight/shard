import {thinky, type, r} from './thinky';

export const User = thinky.createModel('User', {
    username: type.string().required(),
    password: type.string().required().options({enforce_missing: false}),
    email: type.string().email().required(),
    isEmailValid: type.boolean().default(false),
    verifyId: type.string(),
    registered: type.date().default(r.now()),
    status: type.string().default('offline'),
    statusMessage: type.string().default(''),
    subscriptions: type.array().schema(type.object().schema({
        authSecret: type.string().required(),
        endpoint: type.string().required(),
        key: type.string().required(),
    })).default([]),
    passwordReset: type.object().schema({
        date: type.date().default(0),
        token: type.string().default('-1'),
    }),
    // bot params
    type: type.string().enum(['user', 'bot']).default('user'),
    owner: type.string().default('system'),
});
