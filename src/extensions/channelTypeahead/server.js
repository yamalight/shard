import _ from 'lodash';
import ChannelsTypeahead from './base';

class Server extends ChannelsTypeahead {
    constructor({route, db, util}) {
        super();

        const {asyncRequest, logger} = util;

        route.post(asyncRequest(async (req, res) => {
            const {text, currentTeam} = req.body;
            logger.debug('got channel typeahead req:', text, currentTeam);

            const channelsWSub = await db.Channel
                .getJoin({
                    subchannels: {
                        _apply(sequence) {
                            return sequence.filter(ch => ch('users').contains(u => u('id').eq(req.userInfo.id)));
                        },
                    },
                })
                .filter({team: currentTeam})
                .filter(r => r('name').match(`^${text}`)
                    .or(r('subchannels').contains(ch => ch('name').match(`^${text}`)))
                )
                .filter(ch => ch('users').contains(u => u('id').eq(req.userInfo.id)))
                .run();

            const subchannels = channelsWSub.map(ch => ch.subchannels);
            const channels = _.flatten(channelsWSub.concat(subchannels))
                .filter(ch => (new RegExp(`^${text}`)).test(ch.name));

            res.send({channels});
        }));
    }
}

export default [Server];
