import get from './get';
import create from './create';
import invite from './invite';

export default (app) => {
    get(app);
    create(app);
    invite(app);
};
