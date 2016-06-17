import login from './login';
import register from './register';
import verify from './verify';
import passreset from './passreset';
import passresetAccept from './passresetAccept';

export default (app) => {
    login(app);
    register(app);
    verify(app);
    passreset(app);
    passresetAccept(app);
};
