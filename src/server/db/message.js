import {thinky, type, r} from './thinky';
import {User} from './user';

const messageModel = {
    message: type.string().required(),
    userId: type.string().required(),
    channel: type.string().required(),
    time: type.date().default(r.now()),
    readBy: type.array().schema(type.string()).default([]),
};

export const Message = thinky.createModel('Message', messageModel);
export const Reply = thinky.createModel('Reply', {
    ...messageModel,
    replyTo: type.string().required(),
});

// link
Message.hasMany(Reply, 'replies', 'id', 'replyTo');
Message.belongsTo(User, 'user', 'userId', 'id');
Reply.belongsTo(User, 'user', 'userId', 'id');
