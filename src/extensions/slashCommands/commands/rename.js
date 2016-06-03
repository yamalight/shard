export default {
    rename: {
        name: 'Rename channel',
        async execute(context) {
            const {args, team, channel, util: {api, logger}} = context;

            const name = args.trim();

            try {
                const {status, body} = await api.channel.updateChannel({name, team, id: channel});
                logger.debug('renamed channel:', status, body);
            } catch (e) {
                logger.error('error renaming channel:', e);
            }

            return false;
        },
    },
};
