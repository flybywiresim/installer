const initialState = {
    showWarningModal: false
};

const reducer = (state = initialState, action: any) => {
    switch (action.type) {
        case 'SHOW_WARNING_MODAL':
            return {
                ...action.payload
            };
        default:
            return state;
    }
};

export default reducer;
