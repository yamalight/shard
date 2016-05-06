import r from 'rethinkdb';
import {logger} from '../util';
import {rdb} from './connection';

/*
const MessageSchema = new Schema({
    message: String,
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    channel: {type: Schema.Types.ObjectId, ref: 'Channel'},
    time: {type: Date, default: Date.now},
});
*/

const userFields = ['id', 'username'];

const table = async function() {
    const {db, connection} = await rdb();
    const t = db.table('messages');
    return {db, t, connection};
};

const find = async function(pattern) {
    const {db, t, connection} = await table();
    const cursor = await t.orderBy('time')
        .filter(pattern)
        .merge(c => ({user: db.table('users').get(c('user')).pluck(userFields)}))
        .limit(10)
        .run(connection);
    let result = [];
    try {
        result = await cursor.toArray();
    } catch (err) {
        // check if it's just nothing found error
        if (err.name === 'ReqlDriverError' && err.message === 'No more rows in the cursor.') {
            logger.debug('error, no users found');
        } else {
            throw err;
        }
    }
    connection.close();
    return result;
};

const findStream = async function(pattern) {
    const {db, t, connection} = await table();
    const cursor = await t.filter(pattern)
        .changes()
        .map(c => c('new_val'))
        .merge(c => ({user: db.table('users').get(c('user')).pluck(userFields)}))
        .run(connection);
    return cursor;
};

const get = async function(id) {
    const {db, t, connection} = await table();
    let result = null;
    try {
        result = await t.get(id)
            .merge(c => ({user: db.table('users').get(c('user')).pluck(userFields)}))
            .run(connection);
    } catch (err) {
        // check if it's just nothing found error
        if (err.name === 'ReqlDriverError' && err.message === 'No more rows in the cursor.') {
            logger.debug('error, no messages found');
        } else {
            throw err;
        }
    }
    connection.close();
    return result;
};

const create = async function(data) {
    const {t, connection} = await table();
    const res = t.insert({
        time: r.now(),
        ...data,
    }).run(connection);
    return res;
};

const update = async function(pattern, data) {
    const {t, connection} = await table();
    logger.debug('updating message:', pattern, 'with:', data);
    return t.get(pattern).update(data).run(connection);
};

const del = async function(id) {
    const {t, connection} = await table();
    const result = await t.get(id).delete().run(connection);
    connection.close();
    return result;
};

export const Message = {
    find,
    findStream,
    get,
    create,
    update,
    del,
};
