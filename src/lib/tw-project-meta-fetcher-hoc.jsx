import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import log from './log';

import {setProjectTitle} from '../reducers/project-title';
import {setAuthor, setDescription} from '../reducers/tw';

// Get backend host - same logic as render-gui.jsx
const DEFAULT_BACKEND_HOST = process.env.BACKEND_URL || 'https://localhost:8080';

const getCustomBackendHost = () => {
    if (typeof window === 'undefined') return null;
    const searchParams = new URLSearchParams(window.location.search);
    const backendHostParam = searchParams.get('backend_host');
    const backendHost = backendHostParam || DEFAULT_BACKEND_HOST;

    // Only return if it's a custom backend (not TurboWarp/Scratch)
    if (backendHost &&
        !backendHost.includes('scratch.mit.edu') &&
        !backendHost.includes('turbowarp.org') &&
        !backendHost.includes('penguinmod.com')) {
        return backendHost;
    }
    return null;
};

export const fetchProjectMeta = async projectId => {
    const customBackendHost = getCustomBackendHost();

    // Custom backend: fetch from own API
    if (customBackendHost) {
        const url = `${customBackendHost}/api/projects/${projectId}`;
        const res = await fetch(url, { credentials: 'include' });
        if (!res.ok) {
            throw new Error(`Failed to fetch project meta: ${res.status}`);
        }
        const data = await res.json();
        // Add backendHost for avatar URL construction
        data._backendHost = customBackendHost;
        return data;
    }

    // Default TurboWarp behavior
    const urls = [
        `https://trampoline.turbowarp.org/api/projects/${projectId}`,
        `https://trampoline.turbowarp.xyz/api/projects/${projectId}`
    ];
    let firstError;
    for (const url of urls) {
        try {
            const res = await fetch(url);
            const data = await res.json();
            if (res.ok) {
                return data;
            }
            if (res.status === 404) {
                throw new Error('Project is probably unshared');
            }
            throw new Error(`Unexpected status code: ${res.status}`);
        } catch (err) {
            if (!firstError) {
                firstError = err;
            }
        }
    }
    throw firstError;
};

const getNoIndexTag = () => document.querySelector('meta[name="robots"][content="noindex"]');
const setIndexable = indexable => {
    if (indexable) {
        const tag = getNoIndexTag();
        if (tag) {
            tag.remove();
        }
    } else if (!getNoIndexTag()) {
        const tag = document.createElement('meta');
        tag.name = 'robots';
        tag.content = 'noindex';
        document.head.appendChild(tag);
    }
};

const TWProjectMetaFetcherHOC = function (WrappedComponent) {
    class ProjectMetaFetcherComponent extends React.Component {
        componentDidUpdate (prevProps) {
            // project title resetting is handled in titled-hoc.jsx
            if (this.props.reduxProjectId !== prevProps.reduxProjectId) {
                this.props.onSetAuthor('', '');
                this.props.onSetDescription('', '');
                const projectId = this.props.reduxProjectId;

                if (projectId === '0') {
                    // don't try to get metadata
                } else {
                    fetchProjectMeta(projectId).then(data => {
                        // If project ID changed, ignore the results.
                        if (this.props.reduxProjectId !== projectId) {
                            return;
                        }

                        const title = data.title;
                        if (title) {
                            this.props.onSetProjectTitle(title);
                        }
                        const authorName = data.author.username;
                        // Custom backend: use /api/avatar/{id}, otherwise TurboWarp
                        const authorThumbnail = data._backendHost ?
                            `${data._backendHost}/api/avatar/${data.author.id}` :
                            `https://trampoline.turbowarp.org/avatars/${data.author.id}`;
                        this.props.onSetAuthor(authorName, authorThumbnail);
                        const instructions = data.instructions || '';
                        const credits = data.description || '';
                        if (instructions || credits) {
                            this.props.onSetDescription(instructions, credits);
                        }
                        setIndexable(true);
                    })
                        .catch(err => {
                            setIndexable(false);
                            if (`${err}`.includes('unshared')) {
                                this.props.onSetDescription('unshared', 'unshared');
                            }
                            log.warn('cannot fetch project meta', err);
                        });
                }
            }
        }
        render () {
            const {
                /* eslint-disable no-unused-vars */
                reduxProjectId,
                onSetAuthor,
                onSetDescription,
                onSetProjectTitle,
                /* eslint-enable no-unused-vars */
                ...props
            } = this.props;
            return (
                <WrappedComponent
                    {...props}
                />
            );
        }
    }
    ProjectMetaFetcherComponent.propTypes = {
        reduxProjectId: PropTypes.string,
        onSetAuthor: PropTypes.func,
        onSetDescription: PropTypes.func,
        onSetProjectTitle: PropTypes.func
    };
    const mapStateToProps = state => ({
        reduxProjectId: state.scratchGui.projectState.projectId
    });
    const mapDispatchToProps = dispatch => ({
        onSetAuthor: (username, thumbnail) => dispatch(setAuthor({
            username,
            thumbnail
        })),
        onSetDescription: (instructions, credits) => dispatch(setDescription({
            instructions,
            credits
        })),
        onSetProjectTitle: title => dispatch(setProjectTitle(title))
    });
    return connect(
        mapStateToProps,
        mapDispatchToProps
    )(ProjectMetaFetcherComponent);
};

export {
    TWProjectMetaFetcherHOC as default
};
