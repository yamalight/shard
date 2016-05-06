import {logger} from '../util';
import {rdb} from './connection';

/*
const TeamSchema = new Schema({
    name: String,
    users: [{
        id: {type: Schema.Types.ObjectId, ref: 'User'},
        access: {type: String, enum: ['owner', 'admin', 'member']},
    }],
});
*/

const userFields = ['id', 'username'];

const table = async function() {
    const {db, connection} = await rdb();
    const t = db.table('teams');
    return {db, t, connection};
};

const find = async function(pattern) {
    logger.debug('finding teams: ', pattern);
    const {db, t, connection} = await table();
    const cursor = await t.filter(pattern)
        // .merge(c => ({users: c('users').map(u => ({user: db.table('users').get(u('id')).pluck(userFields)}))}))
        .run(connection);
    let result = [];
    try {
        result = await cursor.toArray();
    } catch (err) {
        // check if it's just nothing found error
        if (err.name === 'ReqlDriverError' && err.message === 'No more rows in the cursor.') {
            logger.debug('error, no teams found');
        } else {
            throw err;
        }
    }
    connection.close();
    return result;
};

const findForUser = async function(userId) {
    logger.debug('finding teams for user: ', userId);
    const {db, t, connection} = await table();
    const cursor = await t.filter(team => team('users').contains(u => u('id').eq(userId)))
        // .merge(c => ({users: c('users').map(u => ({user: db.table('users').get(u('id')).pluck(userFields)}))}))
        .run(connection);
    let result = [];
    try {
        result = await cursor.toArray();
    } catch (err) {
        // check if it's just nothing found error
        if (err.name === 'ReqlDriverError' && err.message === 'No more rows in the cursor.') {
            logger.debug('error, no teams found for user', userId);
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
            .merge(c => ({users: c('users').merge(u => ({user: db.table('users').get(u('id')).pluck(userFields)}))}))
            .run(connection);
    } catch (err) {
        // check if it's just nothing found error
        if (err.name === 'ReqlDriverError' && err.message === 'No more rows in the cursor.') {
            logger.debug('error, no components found');
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
    logger.debug('updating team:', id, 'with:', data);
    return t.get(id).update(data).run(connection);
};

const addUser = async function({team, user, access = 'member'}) {
    const {t, connection} = await table();
    logger.debug('adding user:', user, ' to team:', team);
    return t.get(team).update(row => ({users: row('users').append({id: user, access})})).run(connection);
};

const del = async function(id) {
    const {t, connection} = await table();
    const result = await t.get(id).delete().run(connection);
    connection.close();
    return result;
};

export const Team = {
    find,
    findForUser,
    get,
    create,
    update,
    del,
    addUser,
};
