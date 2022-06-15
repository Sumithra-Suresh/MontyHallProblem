

export const MACHINE = {
    state: 'USER_SELECTION',
    transitions: {
        USER_SELECTION: {
            press() {
                this.state = 'HOST_REVEAL'
            }
        },
        HOST_REVEAL: {
            press() {
                this.state = 'REVEAL_WIN';
            },
        },
        REVEAL_WIN: {
            press() {
                this.state = 'USER_SELECTION';
            },
        },
    },
    dispatch(actionName) {
        const action = this.transitions[this.state][actionName];

        if (action) {
            action.call(this);
        } else {
            console.log('invalid action');
        }
    },
};
