import get from './get';
import register from './register';

export {createNotification} from './createNotification';

export default (app) => {
    get(app);
    register(app);
};
