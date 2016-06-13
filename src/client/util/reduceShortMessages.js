// upserts message into old messages array
export const reduceShortMessages = (result = [], message) => {
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
    if (lastMessage.user.id === message.user.id &&
        (!lastMessage.replies || !lastMessage.replies.length) &&
        !(message.replies && message.replies.length > 0)
    ) {
        if (!lastMessage.moreMessages) {
            lastMessage.moreMessages = [];
        }
        lastMessage.moreMessages.push(message);
    } else {
        result.push(message);
    }

    return result;
};

export const addReplyMessage = (result = [], message, notifyConfig = {}) => {
    if (result.length === 0) {
        return result;
    }

    // try to find same message on top level
    let oldIndex = result.findIndex(msg => msg.id === message.replyTo);
    if (oldIndex !== -1) {
        result[oldIndex].replies = reduceShortMessages( // eslint-disable-line
            result[oldIndex].replies,
            message,
            notifyConfig
        );
        return result;
    }

    // try to find same message in more messages
    let nestedIndex = -1;
    oldIndex = result.findIndex(el => {
        if (!el.moreMessages) {
            return false;
        }
        nestedIndex = el.moreMessages.findIndex(msg => msg.id === message.replyTo);
        return nestedIndex !== -1;
    });
    if (oldIndex !== -1 && nestedIndex !== -1) {
        const topMsg = result[oldIndex];
        const oldMsg = result[oldIndex].moreMessages[nestedIndex];
        oldMsg.replies = reduceShortMessages( // eslint-disable-line
            result[oldIndex].moreMessages[nestedIndex].replies,
            message,
            notifyConfig
        );
        // remove from more
        result[oldIndex].moreMessages.splice(nestedIndex, 1);
        // replace in top level
        result.splice(oldIndex, 1, topMsg, oldMsg);
        return result;
    }

    return result;
};
