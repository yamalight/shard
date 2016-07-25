import _ from 'lodash';
import webPush from 'web-push';
import {Notification, Channel, User, Settings, r} from '../db';
import {logger, meTeam} from '../util';
import {webPush as webPushConfig} from '../../../config';

// set key
webPush.setGCMAPIKey(webPushConfig.gcmKey);

// define TTL - 24h
const TTL = 60 * 60 * 24;

// default notification settings
export const getDefaultSettings = (ch) => {
    if (ch.type === 'conversation') {
        return {notifications: 'all'};
    }

    return {notifications: 'mentions'};
};

const sendPush = async ({u, t, channel, notifyMessage}) => {
    // get channel name
    let channelName = channel.name;
    // if channel is conversation - get other user's name
    if (channel.type === 'conversation') {
        const uid = channel.users.filter(usr => usr.id !== u.id)[0].id;
        logger.debug('getting user:', uid);
        // if it is - use other user's name
        const user = await r.table('User').get(uid).run();
        logger.debug('got user:', user);
        channelName = user.username;
    }

    const payload = {
        team: _.camelCase(t.name),
        channel: _.camelCase(channelName),
        message: notifyMessage,
    };
    logger.debug('pushing payload:', payload);

    const res = await Promise.all(
        u.subscriptions
        .map(sub => webPush.sendNotification(sub.endpoint, {
            TTL,
            payload: JSON.stringify(payload),
            userPublicKey: sub.key,
            userAuth: sub.authSecret,
        }))
    );

    // get failed requests
    const failed = res
        .map(it => JSON.parse(it))
        .map((it, idx) => ({...it, sub: u.subscriptions[idx]}))
        .filter(it => it.results.some(s => s.error))
        .map(it => it.sub);
    const working = _.difference(u.subscriptions, failed);
    // overwrite current user subscriptions with working only
    u.subscriptions = working; // eslint-disable-line
    await u.save();

    return res;
};

const notifyUser = async ({message, team, channel, user}) => {
    const set = await Settings.filter({channel: channel.id, user}).limit(1);
    const settings = set.pop() || getDefaultSettings(channel);
    logger.debug('got settings for user:', user, 'settings:', settings);
    // if user disabled notifications - die
    if (settings.notifications === 'none') {
        logger.debug('no notifications set, dying');
        return;
    }
    // get user
    const u = await User.get(user);
    const t = await r.table('Team')
        .get(team)
        .default(meTeam)
        .run();
    logger.debug('got target user info:', u);
    // if user set notifications for all - just create new notification:
    if (settings.notifications === 'all') {
        logger.debug('creating notification:', {message, user, team, channel});
        const messageStart = t.id === meTeam.id ?
            'New private message from' : `New message in #${_.camelCase(channel.name)} by`;
        const notifyMessage = `${messageStart} @${message.user.username}:
> ${message.message}`;
        const notification = new Notification({
            message: notifyMessage,
            user: message.user.id,
            team,
            channel: channel.id,
        });
        const it = await notification.save();
        // send push to user clients
        const res = await sendPush({u, t, channel, notifyMessage});
        logger.debug('created notification:', it, res);
        return;
    }
    // if user set notifications for mentions - try to find mentioned user
    if (settings.notifications === 'mentions') {
        logger.debug(`searching for mentions of ${u.username} in "${message.message}"`);
        const regex = new RegExp(`@${u.username}`, 'i');
        if (!regex.test(message.message)) {
            logger.debug('user mention not found!');
            return;
        }
        logger.debug('user found, creating notification:', {message, user, team, channel});
        const messageStart = t.id === meTeam.id ?
            'New private mention from' : `New mention in #${_.camelCase(channel.name)} by`;
        const notifyMessage = `${messageStart} @${message.user.username}:
> ${message.message}`;
        const notification = new Notification({
            message: notifyMessage,
            user: message.user.id,
            team,
            channel: channel.id,
        });
        const it = await notification.save();
        // send push to user clients
        const res = await sendPush({u, t, channel, notifyMessage});
        logger.debug('created notification:', it, res);
        return;
    }
};

export const createNotification = async ({message, team, channel, user}) => {
    // get channel
    const ch = await Channel.get(channel);
    logger.debug('processing notification for:', ch, user, message);
    // get list of users who are not current user
    const users = ch.users.filter(u => u.id !== user.id);
    logger.debug('users to be notified:', users);
    // notify all users according to their preferences
    return Promise.all(users.map(u => u.id).map(id => notifyUser({message, team, channel: ch, user: id})));
};
