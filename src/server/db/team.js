import {thinky, type} from './thinky';

export const Team = thinky.createModel('Team', {
    name: type.string().required(),
    description: type.string(),
    isPrivate: type.boolean().default(true).required(),
    users: [{
        id: type.string(),
        access: type.string().enum(['owner', 'admin', 'member']).default('member'),
    }],
});
