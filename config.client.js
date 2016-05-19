// extensions
import userTypeahead from './src/extensions/userTypeahead/client';
import channelTypeahead from './src/extensions/channelTypeahead/client';

export const extensions = [
    ...userTypeahead,
    ...channelTypeahead,
];
