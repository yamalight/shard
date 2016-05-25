import Push from 'push.js';

const notify = ({notifyAboutNew = false, team, channel, message} = {}) => {
    if (notifyAboutNew) {
        Push.create(`Shard: ${team.name}#${channel.name}`, {
            body: `@${message.user.username}: ${message.message}`,
            timeout: 3000,
        });
    }
};

export const reduceShortMessages = (result = [], message, notifyConfig = {}) => {
    const lastIndex = result.length - 1;
    if (lastIndex < 0) {
        return [message];
    }

    // try to find same message on top level
    let oldIndex = result.findIndex(msg => msg.id === message.id);
    if (oldIndex !== -1) {
        result[oldIndex] = { // eslint-disable-line
            ...result[oldIndex],
            ...message,
        };
        return result;
    }

    // try to find same message in more messages
    let nestedIndex = -1;
    oldIndex = result.findIndex(el => {
        if (!el.moreMessages) {
            return false;
        }
        nestedIndex = el.moreMessages.findIndex(msg => msg.id === message.id);
        return nestedIndex !== -1;
    });
    if (oldIndex !== -1 && nestedIndex !== -1) {
        result[oldIndex].moreMessages[nestedIndex] = {// eslint-disable-line
            ...result[oldIndex].moreMessages[nestedIndex],
            ...message,
        };
        return result;
    }

    // check if old message is from same user
    const lastMessage = result[lastIndex];
    if (lastMessage.user.id === message.user.id && (!lastMessage.replies || !lastMessage.replies.length)) {
        if (!lastMessage.moreMessages) {
            lastMessage.moreMessages = [];
        }
        lastMessage.moreMessages.push(message);
        notify({...notifyConfig, message});
    } else {
        result.push(message);
        notify({...notifyConfig, message});
    }

    return result;
};
