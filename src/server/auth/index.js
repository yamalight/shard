import login from './login';
import register from './register';
import verify from './verify';

export default (app) => {
    login(app);
    register(app);
    verify(app);
};
