import {thinky, type, r} from './thinky';

const messageModel = {
    message: type.string().required(),
    user: type.string().required(),
    channel: type.string().required(),
    time: type.date().default(r.now()),
};

export const Message = thinky.createModel('Message', messageModel);
export const Reply = thinky.createModel('Reply', {
    ...messageModel,
    replyTo: type.string().required(),
});

// link
Message.hasMany(Reply, 'replies', 'id', 'replyTo');
