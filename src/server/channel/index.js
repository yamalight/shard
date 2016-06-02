import get from './get';
import getPublic from './getPublic';
import create from './create';
import update from './update';
import deletech from './delete';
import join from './join';

export default (app) => {
    get(app);
    getPublic(app);
    create(app);
    update(app);
    deletech(app);
    join(app);
};
