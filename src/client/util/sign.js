export const sign = (data) => ({
    ...data,
    token: localStorage.getItem('token'),
});
