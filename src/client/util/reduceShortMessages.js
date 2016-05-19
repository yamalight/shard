export const reduceShortMessages = (result = [], message) => {
    const lastIndex = result.length - 1;
    if (lastIndex < 0) {
        return [message];
    }

    // try to find same message on top level
    let oldIndex = result.findIndex(msg => msg.id === message.id);
    if (oldIndex !== -1) {
        result.splice(oldIndex, 1, message);
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
        result[oldIndex].moreMessages.splice(nestedIndex, 1, message);
        return result;
    }

    // check if old message is from same user
    const lastMessage = result[lastIndex];
    if (lastMessage.user.id === message.user.id && (!lastMessage.replies || !lastMessage.replies.length)) {
        if (!lastMessage.moreMessages) {
            lastMessage.moreMessages = [];
        }
        lastMessage.moreMessages.push(message);
    } else {
        result.push(message);
    }

    return result;
};
