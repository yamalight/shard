import {Channel} from '../db';
import {logger, asyncRequest} from '../util';
import checkAuth from '../auth/checkAuth';

export const deleteChannel = async (id) => {
    // otherwise save channel
    const channel = await Channel.get(id).delete().execute();
    logger.info('deleted channel:', channel);
    return {status: 204};
};

export default (app) => {
    app.delete('/api/channels/:id', checkAuth, asyncRequest(async (req, res) => {
        const {id} = req.params;
        logger.info('deleting channel:', id, 'by:', req.userInfo.username);
        const {status} = await deleteChannel(id);
        res.sendStatus(status);
    }));
};
