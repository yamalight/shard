export default {
    invite: {
        name: 'Invite user to team/channel',
        async execute(context) {
            const {args, team, channel, user, util: {api, logger}} = context;

            const username = args.trim();

            try {
                const {status, body} = await api.team.inviteToTeam({
                    id: team,
                    username,
                    channel,
                    userInfo: user,
                });
                logger.debug('invited to channel:', status, body);
            } catch (e) {
                logger.error('error inviting to channel:', e);
            }

            return false;
        },
    },
};
