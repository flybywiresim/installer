const initialState = {
    showchangelog: false
};

const reducer = (state = initialState, action: any) => {
    switch (action.type) {
        case 'CHANGELOG':
            return {
                ...action.payload
            };
        default:
            return state;
    }
};

export default reducer;
