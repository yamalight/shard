import _ from 'lodash';

// extensions
import userTypeahead from './src/extensions/userTypeahead/client';
import channelTypeahead from './src/extensions/channelTypeahead/client';
import slashCommands from './src/extensions/slashCommands/client';
import usersSidebar from './src/extensions/usersSidebar/client';

export const extensions = _.flatten([
    userTypeahead,
    channelTypeahead,
    slashCommands,
    usersSidebar,
]);
