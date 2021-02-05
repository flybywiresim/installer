const initialState = {
    warningmessage: ''
};

const reducer = (state = initialState, action: any) => {
    switch (action.type) {
        case 'WARNING':
            return {
                ...action.payload
            };
        default:
            return state;
    }
};

export default reducer;
