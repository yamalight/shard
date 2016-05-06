import {thinky, type, r} from './thinky';

export const User = thinky.createModel('User', {
    username: type.string().required(),
    password: type.string().required().options({enforce_missing: false}),
    // tag: type.number(),
    registered: type.date().default(r.now()),
    status: type.string().default('offline'),
    statusMessage: type.string().default(''),
});
