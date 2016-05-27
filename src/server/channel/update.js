import {Channel, Subchannel} from '../db';
import {logger, asyncRequest} from '../util';
import checkAuth from '../auth/checkAuth';

export const updateChannel = async ({id, name, description, team, parent = 'none'} = {}) => {
    // do not update channel with empty name
    if (!name || !name.length) {
        return {status: 400, body: {error: 'No channel name given!'}};
    }
    // do not update non alpha-numeric channels
    const nameRegex = /^[a-z0-9\s-]+$/i;
    if (!nameRegex.test(name)) {
        return {status: 400, body: {error: 'Channel name must be alpha-numeric with spaces and dashes!'}};
    }
    // do not update duplicate channels under same team & parent
    let existing = 0;
    if (parent === 'none') {
        existing = await Channel
            .filter(row =>
                row('team').eq(team)
                .and(row('name').downcase().eq(name.toLowerCase()))
                .and(row('id').ne(id))
            )
            .count()
            .execute();
    } else {
        existing = await Subchannel
            .filter(row =>
                row('parentChannel').eq(parent)
                .and(row('team').eq(team))
                .and(row('name').downcase().eq(name.toLowerCase()))
                .and(row('id').ne(id))
            )
            .count()
            .execute();
    }
    if (existing > 0) {
        return {status: 400, body: {error: 'Channel with that name already exists!'}};
    }
    // init channel data
    const data = {};
    // only update if value is given
    if (name) {
        data.name = name;
    }
    if (description) {
        data.description = description;
    }
    if (team) {
        data.team = team;
    }

    // check if we need to save subchannel
    if (parent !== 'none') {
        logger.debug('saving subchannel!');
        const subchannel = await Subchannel.get(id).update({
            ...data,
            parentChannel: parent,
        });
        logger.info('updated subchannel:', subchannel);
        return {status: 200, body: subchannel};
    }

    // otherwise save channel
    const channel = await Channel.get(id).update(data);
    logger.info('updated channel:', channel);
    return {status: 200, body: channel};
};

export default (app) => {
    app.post('/api/channels/:id', checkAuth, asyncRequest(async (req, res) => {
        const {id} = req.params;
        const {name, description, team, parent = 'none'} = req.body;
        logger.info('updating channel:', id, 'with:', {name, description, team, parent}, 'by:', req.userInfo.username);
        const {status, body} = await updateChannel({name, description, team, parent, id});
        res.status(status).json(body);
    }));
};
