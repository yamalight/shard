export default {
    description: {
        name: 'Show channel description',
        execute({utils}) {
            utils.storeActions.activateInfobar('description');
            return false;
        },
    },
};
