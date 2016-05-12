import {thinky, type} from './thinky';

const channelSchema = {
    name: type.string().required(),
    team: type.string().required(),
    description: type.string(),
    users: [{
        id: type.string(),
        access: type.string().enum(['owner', 'admin', 'member']).default('member'),
    }],
};

export const Channel = thinky.createModel('Channel', channelSchema);
export const Subchannel = thinky.createModel('Subchannel', {
    ...channelSchema,
    parentChannel: type.string().required(),
});

Channel.hasMany(Subchannel, 'subchannels', 'id', 'parentChannel');
