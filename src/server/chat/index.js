import history from './history';
import newmessage from './newmessage';
import markread from './markread';
import reply from './reply';
import messagews from './messagews';
import updatemessage from './updatemessage';
import updatereply from './updatereply';

export default (app) => {
    history(app);
    newmessage(app);
    markread(app);
    reply(app);
    messagews(app);
    updatemessage(app);
    updatereply(app);
};
