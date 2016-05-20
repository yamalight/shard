import get from './get';
import getTeam from './getTeam';
import create from './create';
import invite from './invite';

export default (app) => {
    get(app);
    getTeam(app);
    create(app);
    invite(app);
};
