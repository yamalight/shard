import hello from './hello';
import rename from './rename';
import invite from './invite';

export const defaultCommands = {
    ...hello,
    ...rename,
    ...invite,
};
