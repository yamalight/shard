import checkAuth from '../auth/checkAuth';
import moment from 'moment';
import {hash} from 'spark-md5';
import {logger, asyncRequest} from '../util';
import {Message, Channel, User} from '../db';

// TODO: split into separate package?
import {markdown} from './markdown';

// TODO: better styling? proper templating?
import {style} from './style';

// time formatting
const formatTime = (time) => {
    const t = moment(time);

    // if older than 1 day, format as date
    const yesterday = moment().subtract(1, 'day');
    if (t.isBefore(yesterday)) {
        return t.format('llll');
    }

    // otherwise return relative string
    return t.fromNow();
};

export default (app) => {
    app.get('/api/message/:id/embed', checkAuth, asyncRequest(async (req, res) => {
        const {id} = req.params;
        logger.info('embed msg:', {id, user: req.userInfo});

        // get messsage, user and channel
        const message = await Message.get(id);
        const user = await User.get(message.userId);
        const channel = await Channel.get(message.channel);

        // if user is not in the channel and channel is not public
        if (channel.isPrivate && !channel.users.find(u => u.id === req.userInfo.id)) {
            return res.status(401).send({error: 'You don\'t have rights to see this message!'});
        }

        const html = `<html>
            <head>
                <title>Shard: Message by ${user.username} in #${channel.name}</title>
                <style>${style}</style>
            </head>
            <body>
                <article class="media">
                    <figure class="media-left">
                        <p class="image is-64x64">
                            <img src="//www.gravatar.com/avatar/${hash(user.email)}" alt="${user.username}" />
                        </p>
                    </figure>
                    <div class="media-content">
                        <div class="content message-content">
                            <div class="message-header">
                                <strong>${user.username} <small>${formatTime(message.time)}</small></strong>
                            </div>
                            <p>${markdown(message.message)}</p>
                        </div>
                    </div>
                </article>
            </body>
        </html>`;

        // send message embed
        return res.send(html);
    }));
};
