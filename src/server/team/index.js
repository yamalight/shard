import get from './get';
import getPublic from './getPublic';
import getTeam from './getTeam';
import create from './create';
import invite from './invite';

export default (app) => {
    get(app);
    getPublic(app);
    getTeam(app);
    create(app);
    invite(app);
};
