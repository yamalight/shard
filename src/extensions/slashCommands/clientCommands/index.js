import description from './description';

export const defaultCommands = {
    ...description,
};

export const getClientCommands = () => ({
    ...defaultCommands,
    ...window.shardApp.slashCommands,
});
