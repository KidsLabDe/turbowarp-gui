/**
 * Session reducer for managing user authentication state.
 * This reducer stores session data at the root level (state.session)
 * which is expected by components like MenuBar.
 */

const SET_SESSION = 'session/SET_SESSION';
const SET_SESSION_STATUS = 'session/SET_SESSION_STATUS';

// Status constants
export const Status = {
    NOT_FETCHED: 'NOT_FETCHED',
    FETCHING: 'FETCHING',
    FETCHED: 'FETCHED',
    ERROR: 'ERROR'
};

export const initialState = {
    status: Status.NOT_FETCHED,
    session: undefined
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case SET_SESSION:
        return Object.assign({}, state, {
            session: action.session,
            status: Status.FETCHED
        });
    case SET_SESSION_STATUS:
        return Object.assign({}, state, {
            status: action.status
        });
    default:
        return state;
    }
};

/**
 * Set the session data
 * @param {Object} session - Session object with user data
 * @param {Object} session.user - User object
 * @param {string} session.user.username - Username
 * @returns {Object} Redux action
 */
const setSession = function (session) {
    return {
        type: SET_SESSION,
        session
    };
};

/**
 * Set the session fetch status
 * @param {string} status - One of Status constants
 * @returns {Object} Redux action
 */
const setSessionStatus = function (status) {
    return {
        type: SET_SESSION_STATUS,
        status
    };
};

export {
    reducer as default,
    initialState as sessionInitialState,
    setSession,
    setSessionStatus
};
