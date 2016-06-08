import search from './search';
import newconversation from './newconversation';

export default (app) => {
    search(app);
    newconversation(app);
};
