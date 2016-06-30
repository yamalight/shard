import TrelloSidebar from './base';

class TrelloSidebarServer extends TrelloSidebar {
    constructor({route, db, util}) {
        super();

        // define DB schema
        const {thinky} = db;
        const {type} = thinky;
        const boardSchema = {
            channel: type.string().required(),
            team: type.string().required(),
            board: type.string().required(),
        };
        const Board = thinky.createModel('TrelloExtension', boardSchema);

        // define routes
        const {asyncRequest, logger} = util;
        // get route to fetch trello board
        route.get(asyncRequest(async (req, res) => {
            const {team, channel} = req.query;
            logger.debug('got trello board sidebar get req:', team, channel);

            // find relevant trello board
            const boards = await Board
                .filter({channel, team})
                .limit(1)
                .run();
            const board = boards[0] || {};

            res.send(board);
        }));
        // post route to save trello board
        route.post(asyncRequest(async (req, res) => {
            const {team, channel, board} = req.body;
            logger.debug('got trello board sidebar save req:', {team, channel, board});

            // try to find existing entry
            const boards = await Board
                .filter({channel, team})
                .limit(1)
                .run();
            const b = boards[0];
            logger.debug('found board:', b);

            // if found - update
            if (b) {
                b.board = board;
                await b.save();
                res.send(b);
                return;
            }

            // if not - create new
            const newBoard = new Board({team, channel, board});
            await newBoard.save();

            res.send(newBoard);
        }));
    }
}

export default [TrelloSidebarServer];
