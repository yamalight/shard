import get from './get';
import register from './register';
import settings from './getsettings';
import updateSettings from './updatesettings';

export {createNotification} from './createNotification';

export default (app) => {
    get(app);
    register(app);
    settings(app);
    updateSettings(app);
};
