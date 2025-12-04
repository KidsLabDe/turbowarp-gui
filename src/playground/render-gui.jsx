import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import GUI from '../containers/gui.jsx';

// Backend configuration - can be overridden via BACKEND_URL env var or ?backend_host URL parameter
const DEFAULT_BACKEND_HOST = process.env.BACKEND_URL || 'https://localhost:8080';

const searchParams = new URLSearchParams(location.search);
const cloudHost = searchParams.get('cloud_host') || 'wss://clouddata.turbowarp.org';
// Allow overriding backend host via URL parameter for testing
const backendHostParam = searchParams.get('backend_host');
const backendHost = backendHostParam || DEFAULT_BACKEND_HOST;

// Upload project thumbnail to backend
const updateProjectThumbnail = (projectId, thumbnailBlob) => {
    fetch(`${backendHost}/projects/${projectId}/thumbnail`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': thumbnailBlob.type || 'image/png'
        },
        body: thumbnailBlob
    }).catch(err => {
        console.error('Failed to upload thumbnail:', err);
    });
};

const RenderGUI = props => {
    const {
        session,
        ...componentProps
    } = props;

    // User can save if logged in
    const canSave = session && session.session && session.session.user;

    return (
        <GUI
            cloudHost={cloudHost}
            canUseCloud
            hasCloudPermission
            canSave={canSave}
            projectHost={`${backendHost}/projects`}
            assetHost={`${backendHost}/assets`}
            basePath={process.env.ROOT}
            canEditTitle
            enableCommunity
            onUpdateProjectThumbnail={canSave ? updateProjectThumbnail : undefined}
            {...componentProps}
        />
    );
};

RenderGUI.propTypes = {
    session: PropTypes.shape({
        session: PropTypes.object
    })
};

const mapStateToProps = state => ({
    session: state.session
});

export default connect(mapStateToProps)(RenderGUI);
