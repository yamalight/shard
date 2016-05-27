import get from './get';
import create from './create';
import update from './update';

export default (app) => {
    get(app);
    create(app);
    update(app);
};
