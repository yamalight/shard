import {thinky, type} from './thinky';

const unreadModel = {
    user: type.string().required(),
    team: type.string().required(),
    channel: type.string().required(),
    count: type.number().integer().default(0),
};

export const Unread = thinky.createModel('Unread', unreadModel);
