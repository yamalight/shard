export const requireAuth = (nextState, replace) => {
    if (!localStorage.getItem('token')) {
        replace({
            pathname: '/',
            state: {
                nextPathname: nextState.location.pathname,
            },
        });
    }
};
