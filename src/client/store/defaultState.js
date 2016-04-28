export default {
    // auth state
    authStatus: 'init',
    registerError: '',
    authError: '',
    user: JSON.parse(localStorage.getItem('user') || '{}'),
    token: localStorage.getItem('token'),
};
