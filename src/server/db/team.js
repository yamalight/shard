import {thinky, type} from './thinky';

export const Team = thinky.createModel('Team', {
    name: type.string().required(),
    users: [{
        id: type.string(),
        access: type.string().enum(['owner', 'admin', 'member']).default('member'),
    }],
});
