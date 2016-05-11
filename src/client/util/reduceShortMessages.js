export const reduceShortMessages = arr => arr
    .filter(m => m !== undefined)
    .reduce((result, message) => {
        const lastIndex = result.length - 1;
        if (lastIndex < 0) {
            return [message];
        }

        const lastMessage = result[lastIndex];
        if (lastMessage.user.id === message.user.id) {
            lastMessage.moreMessages.push(message);
        } else {
            result.push(message);
        }

        return result;
    }, []);
