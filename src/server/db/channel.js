import {thinky, type} from './thinky';

export const Channel = thinky.createModel('Channel', {
    name: type.string().required(),
    team: type.string().required(),
    description: type.string(),
    users: [{
        id: type.string(),
        access: type.string().enum(['owner', 'admin', 'member']).default('member'),
    }],
});
