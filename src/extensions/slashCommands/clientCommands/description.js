export default {
    description: {
        name: 'Description',
        execute({utils}) {
            utils.storeActions.activateInfobar('description');
            return false;
        },
    },
};
