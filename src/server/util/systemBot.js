import {logger} from './logger';
import {User, Message} from '../db';

let sysBot;
const systemBot = {
    get() {
        return sysBot;
    },

    sendMessage({message, channel}) {
        // save
        const m = new Message({
            message,
            channel,
        });
        m.user = sysBot;
        return m.saveAll({user: true});
    },
};

// create bot
const createBot = async () => {
    const bot = new User({
        username: 'Shard bot',
        password: '',
        email: 'bot@shard.chat',
        isEmailValid: true,
        status: 'online',
        type: 'bot',
    });
    // save
    await bot.save();
    sysBot = bot;
    logger.debug('system bot initialised:', sysBot);
};

// try to find user
User.filter({email: 'bot@shard.chat'})
.limit(1)
.run()
.then(users => {
    // if no users found - create new
    if (users.length === 0) {
        createBot();
        return;
    }

    // if found - just get user
    sysBot = users[0];
    logger.debug('system bot loaded from db:', sysBot);
});


export {systemBot};
