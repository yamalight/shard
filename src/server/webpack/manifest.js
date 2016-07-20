import {webPush} from '../../../config';

export const manifest = {
    name: 'Shard',
    gcm_sender_id: webPush.gcmId,
    display: 'standalone',
    orientation: 'portrait',
    icons: [{
        src: '/img/icons/Chrome Icon.png',
        sizes: '128x128',
        type: 'image/png',
        density: 1,
    }],
};
