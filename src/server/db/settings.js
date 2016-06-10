import {thinky, type} from './thinky';

const settingsSchema = {
    channel: type.string().required(),
    user: type.string().required(),
    notifications: type.string().enum(['all', 'mentions', 'none']).default('mentions'),
};

export const Settings = thinky.createModel('Settings', settingsSchema);
