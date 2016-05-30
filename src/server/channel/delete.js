import {Channel, Subchannel} from '../db';
import {logger, asyncRequest} from '../util';
import checkAuth from '../auth/checkAuth';

export const deleteChannel = async ({id, parent = 'none'} = {}) => {
    // check if we need to save subchannel
    if (parent !== 'none') {
        logger.debug('deleting subchannel!');
        const subchannel = await Subchannel.get(id).delete().execute();
        logger.info('deleted subchannel:', subchannel);
        return {status: 204};
    }

    // otherwise save channel
    const channel = await Channel.get(id).delete().execute();
    logger.info('deleted channel:', channel);
    return {status: 204};
};

export default (app) => {
    app.delete('/api/channels/:id', checkAuth, asyncRequest(async (req, res) => {
        const {id} = req.params;
        const {parent = 'none'} = req.body;
        logger.info('deleting channel:', id, 'with:', {parent}, 'by:', req.userInfo.username);
        const {status} = await deleteChannel({parent, id});
        res.sendStatus(status);
    }));
};
