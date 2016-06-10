import _ from 'lodash';
import webPush from 'web-push';
import {Notification, Channel, User, Settings} from '../db';
import {logger} from '../util';
import {webPush as webPushConfig} from '../../../config';

// set key
webPush.setGCMAPIKey(webPushConfig.gcmKey);

// default notification settings
const defaultSettings = {
    notifications: 'mentions',
};

const notifyUser = async ({message, team, channel, user}) => {
    const set = await Settings.filter({channel, user}).limit(1);
    const settings = set.pop() || defaultSettings;
    logger.debug('got settings for user:', user, 'settings:', settings);
    // if user disabled notifications - die
    if (settings.notifications === 'none') {
        logger.debug('no notifications set, dying');
        return;
    }
    // get user
    const u = await User.get(user);
    logger.debug('got target user info:', u);
    // if user set notifications for all - just create new notification:
    if (settings.notifications === 'all') {
        logger.debug('creating notification:', {message, user, team, channel});
        const notifyMessage = `New message in #${_.camelCase(channel.name)} by @${message.user.username}:
> ${message}`;
        const notification = new Notification({
            message: notifyMessage,
            user,
            team,
            channel: channel.id,
        });
        const r = await notification.save();
        // send push to user clients
        await Promise.all(
            u.subscriptions
            .map(sub => webPush.sendNotification(sub.endpoint, {
                payload: notifyMessage,
                userPublicKey: sub.key,
                userAuth: sub.authSecret,
            }))
        );
        logger.debug('created notification:', r);
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
        const notifyMessage = `New mention in #${_.camelCase(channel.name)} by @${message.user.username}:
> ${message.message}`;
        const notification = new Notification({
            message: notifyMessage,
            user,
            team,
            channel: channel.id,
        });
        const r = await notification.save();
        // send push to user clients
        const res = await Promise.all(
            u.subscriptions
            .map(sub => webPush.sendNotification(sub.endpoint, {
                payload: notifyMessage,
                userPublicKey: sub.key,
                userAuth: sub.authSecret,
            }))
        );
        logger.debug('created notification:', r, res);
        return;
    }
};

export const createNotification = async ({message, team, channel, user}) => {
    // get channel
    const ch = await Channel.get(channel);
    logger.debug('processing notification for:', ch, user, message);
    // get list of users who are not current user
    const users = ch.users.filter(u => u.id !== user);
    logger.debug('users to be notified:', users);
    // notify all users according to their preferences
    return Promise.all(users.map(u => u.id).map(id => notifyUser({message, team, channel: ch, user: id})));
};
