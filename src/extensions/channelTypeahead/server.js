import ChannelsTypeahead from './base';

class ChannelsTypeaheadServer extends ChannelsTypeahead {
    constructor({route, db, util}) {
        super();

        const {asyncRequest, logger} = util;

        route.post(asyncRequest(async (req, res) => {
            const {text, currentTeam} = req.body;
            logger.debug('got channel typeahead req:', text, currentTeam);

            const channelsWSub = await db.Channel
                .filter({team: currentTeam})
                .filter(r => r('name').match(`(?i)^${text}`))
                .filter(ch => ch('users').contains(u => u('id').eq(req.userInfo.id)))
                .run();

            const channels = channelsWSub.filter(ch => (new RegExp(`^${text}`, 'i')).test(ch.name));

            res.send({channels});
        }));
    }
}

export default [ChannelsTypeaheadServer];
