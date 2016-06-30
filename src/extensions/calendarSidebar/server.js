import CalendarSidebar from './base';

class CalendarSidebarServer extends CalendarSidebar {
    constructor({route, db, util}) {
        super();

        // define DB schema
        const {thinky} = db;
        const {type} = thinky;
        const calendarSchema = {
            channel: type.string().required(),
            team: type.string().required(),
            calendar: type.string().required(),
        };
        const Calendar = thinky.createModel('CalendarExtension', calendarSchema);

        // define routes
        const {asyncRequest, logger} = util;
        // get route to fetch calendar
        route.get(asyncRequest(async (req, res) => {
            const {team, channel} = req.query;
            logger.debug('got calendar sidebar get req:', team, channel);

            // find relevant calendar
            const cals = await Calendar
                .filter({channel, team})
                .limit(1)
                .run();
            const cal = cals[0] || {};

            res.send(cal);
        }));
        // post route to save calendar
        route.post(asyncRequest(async (req, res) => {
            const {team, channel, calendar} = req.body;
            logger.debug('got calendar sidebar save req:', {team, channel, calendar});

            // try to find existing entry
            const cals = await Calendar
                .filter({channel, team})
                .limit(1)
                .run();
            const cal = cals[0];
            logger.debug('found calendar:', cal);

            // if found - update
            if (cal) {
                cal.calendar = calendar;
                await cal.save();
                res.send(cal);
                return;
            }

            // if not - create new
            const newCal = new Calendar({team, channel, calendar});
            await newCal.save();

            res.send(newCal);
        }));
    }
}

export default [CalendarSidebarServer];
