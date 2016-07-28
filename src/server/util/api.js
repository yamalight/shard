// channel
import {updateChannel} from '../channel/update';
// team
import {inviteToTeam, inviteToChannel, addToTeam, addToChannel} from '../team/invite';

export const api = {
    channel: {
        updateChannel,
        inviteToChannel,
        addToChannel,
    },
    team: {
        inviteToTeam,
        addToTeam,
    },
};
