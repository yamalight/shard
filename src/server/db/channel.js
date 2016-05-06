import {logger} from '../util';
import {rdb} from './connection';

/*
const ChannelSchema = new Schema({
    name: String,
    description: String,
    team: {type: Schema.Types.ObjectId, ref: 'Team'},
    users: [{
        id: {type: Schema.Types.ObjectId, ref: 'User'},
        access: {type: String, enum: ['owner', 'admin', 'member']},
    }],
});
*/


// const userFields = ['id', 'username'];

const table = async function() {
    const {db, connection} = await rdb();
    const t = db.table('channels');
    return {db, t, connection};
};

const find = async function({team, user}) {
    const {db, t, connection} = await table();
    const cursor = await t.filter({team})
        .filter(ch => ch('users').contains(u => u('id').eq(user)))
        // .merge(c => ({user: db.table('users').get(c('user')).pluck(userFields)}))
        .run(connection);
    let result = [];
    try {
        result = await cursor.toArray();
    } catch (err) {
        // check if it's just nothing found error
        if (err.name === 'ReqlDriverError' && err.message === 'No more rows in the cursor.') {
            logger.debug('error, no channels found');
        } else {
            throw err;
        }
    }
    connection.close();
    return result;
};

const get = async function(id) {
    const {db, t, connection} = await table();
    let result = null;
    try {
        result = await t.get(id)
            // .merge(c => ({user: db.table('users').get(c('user')).pluck(userFields)}))
            .run(connection);
    } catch (err) {
        // check if it's just nothing found error
        if (err.name === 'ReqlDriverError' && err.message === 'No more rows in the cursor.') {
            logger.debug('error, no channel found');
        } else {
            throw err;
        }
    }
    connection.close();
    return result;
};

const create = async function(data) {
    const {t, connection} = await table();
    const res = t.insert(data).run(connection);
    return res;
};

const update = async function(id, data) {
    const {t, connection} = await table();
    logger.debug('updating channel:', id, 'with:', data);
    return t.get(id).update(data).run(connection);
};

const addUser = async function({channel, user, access = 'member'}) {
    const {t, connection} = await table();
    logger.debug('adding user:', user, ' to channel:', channel);
    return t.get(channel).update(row => ({users: row('users').append({id: user, access})})).run(connection);
};

const del = async function(id) {
    const {t, connection} = await table();
    const result = await t.get(id).delete().run(connection);
    connection.close();
    return result;
};

export const Channel = {
    find,
    get,
    create,
    update,
    del,
    addUser,
};
