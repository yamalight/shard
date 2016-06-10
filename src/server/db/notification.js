import {thinky, type, r} from './thinky';

const notificationModel = {
    message: type.string().required(),
    user: type.string().required(),
    team: type.string().required(),
    channel: type.string().required(),
    time: type.date().default(r.now()),
    seen: type.boolean().default(false),
};

export const Notification = thinky.createModel('Notification', notificationModel);
