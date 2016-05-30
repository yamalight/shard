import get from './get';
import create from './create';
import update from './update';
import deletech from './delete';

export default (app) => {
    get(app);
    create(app);
    update(app);
    deletech(app);
};
