import {Team} from '../db';
import {logger, asyncRequest} from '../util';
import checkAuth from '../auth/checkAuth';

export default (app) => {
    app.post('/api/teams/:id', checkAuth, asyncRequest(async (req, res) => {
        const {id} = req.params;
        const {name, description, isPrivate} = req.body;
        logger.info('updating team:', {id, name, isPrivate, owner: req.userInfo.username});
        // do not create team with empty name
        if (!name || !name.length) {
            res.status(400).send({error: 'No team name given!'});
            return;
        }
        // do not create non alpha-numeric channels
        const nameRegex = /^[a-z0-9\s-]+$/i;
        if (!nameRegex.test(name)) {
            res.status(400).send({error: 'Team name must be alpha-numeric with spaces and dashes!'});
            return;
        }
        // do not create duplicate channels under same team & parent
        const existing = await Team
            .filter(row =>
                row('name').downcase().eq(name.toLowerCase())
                .and(row('id').ne(id))
            )
            .count()
            .execute();
        if (existing > 0) {
            res.status(400).send({error: 'Team with that name already exists!'});
            return;
        }

        // init team data
        const data = {
            name,
            isPrivate,
        };
        // only update if value is given
        if (description) {
            data.description = description;
        }

        // save new team
        const team = await Team.get(id).update(data);
        logger.debug('updated team:', team);

        // send team back
        res.status(200).json(team);
    }));
};
