import history from './history';
import newmessage from './newmessage';
import markread from './markread';
import reply from './reply';
import messagews from './messagews';

export default (app) => {
    history(app);
    newmessage(app);
    markread(app);
    reply(app);
    messagews(app);
};
