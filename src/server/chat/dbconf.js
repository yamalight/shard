import {r} from '../db';

// commonly plucked user fields
export const userFields = ['id', 'username', 'email'];

// message join that adds users and replies with users
export const messageJoin = {
    replies: {
        _apply(sequence) {
            return sequence.orderBy('time')
                .getJoin({user: true})
                .merge(c => ({
                    readBy: c('readBy').map(it => r.table('User').get(it).pluck(userFields)),
                }));
        },
    },
    user: true,
};
