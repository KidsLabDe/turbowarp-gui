/**
 * Copyright (C) 2021 Thomas Weber
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {setSession, setSessionStatus, Status} from '../reducers/session';
import {setUsername} from '../reducers/tw';
import log from './log';

// Backend configuration - change this URL to match your backend
const DEFAULT_BACKEND_HOST = 'https://localhost:8080';

/**
 * Higher Order Component to manage session/authentication with a backend.
 * Fetches session on mount and provides session state to wrapped components.
 * @param {React.Component} WrappedComponent component to wrap
 * @returns {React.Component} wrapped component with session management
 */
const TWSessionHOC = function (WrappedComponent) {
    class SessionManager extends React.Component {
        componentDidMount () {
            // Get backend host from URL parameter or use default
            const searchParams = new URLSearchParams(location.search);
            const backendHost = searchParams.get('backend_host') || DEFAULT_BACKEND_HOST;

            // Fetch session from backend
            this.fetchSession(backendHost);
        }

        fetchSession (backendHost) {
            log.info('Fetching session from backend:', backendHost);
            this.props.onSetSessionStatus(Status.FETCHING);

            fetch(`${backendHost}/api/session`, {
                credentials: 'include'
            })
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    }
                    return null;
                })
                .then(data => {
                    if (data && data.loggedIn && data.user) {
                        const username = data.user.name || data.user.username;
                        log.info(`Session found: ${username}`);

                        // Set session in root session reducer (for MenuBar)
                        this.props.onSetSession({
                            user: {
                                username: username,
                                ...data.user
                            }
                        });

                        // Also set the TurboWarp username for cloud variables
                        if (username) {
                            this.props.onSetUsername(username);
                        }
                    } else {
                        log.info('No session found');
                        this.props.onSetSession(null);
                    }
                })
                .catch(err => {
                    log.warn('Session fetch error:', err);
                    this.props.onSetSessionStatus(Status.ERROR);
                });
        }

        render () {
            const {
                /* eslint-disable no-unused-vars */
                onSetSession,
                onSetSessionStatus,
                onSetUsername,
                /* eslint-enable no-unused-vars */
                ...componentProps
            } = this.props;

            return (
                <WrappedComponent
                    {...componentProps}
                />
            );
        }
    }

    SessionManager.propTypes = {
        onSetSession: PropTypes.func.isRequired,
        onSetSessionStatus: PropTypes.func.isRequired,
        onSetUsername: PropTypes.func.isRequired
    };

    const mapStateToProps = state => ({
        session: state.session
    });

    const mapDispatchToProps = dispatch => ({
        onSetSession: session => dispatch(setSession(session)),
        onSetSessionStatus: status => dispatch(setSessionStatus(status)),
        onSetUsername: username => dispatch(setUsername(username))
    });

    return connect(
        mapStateToProps,
        mapDispatchToProps
    )(SessionManager);
};

export default TWSessionHOC;
