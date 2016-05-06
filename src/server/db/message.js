import {thinky, type, r} from './thinky';

export const Message = thinky.createModel('Message', {
    message: type.string().required(),
    user: type.string().required(),
    channel: type.string().required(),
    time: type.date().default(r.now()),
});
