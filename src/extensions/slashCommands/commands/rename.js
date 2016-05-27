export default {
    rename: {
        name: 'Rename channel',
        async execute(context) {
            const {args, team, channel, subchannel, util: {api, logger}} = context;

            const name = args.trim();
            const parent = subchannel ? channel : undefined;

            try {
                const {status, body} = await api.channel.updateChannel({name, team, parent, id: channel});
                logger.debug('renamed channel:', status, body);
            } catch (e) {
                logger.error('error renaming channel:', e);
            }

            return false;
        },
    },
};
