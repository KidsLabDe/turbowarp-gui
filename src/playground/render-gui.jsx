import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import GUI from '../containers/gui.jsx';

// Backend configuration - change this URL to match your backend
const DEFAULT_BACKEND_HOST = 'https://localhost:8080';

const searchParams = new URLSearchParams(location.search);
const cloudHost = searchParams.get('cloud_host') || 'wss://clouddata.turbowarp.org';
// Allow overriding backend host via URL parameter for testing
const backendHostParam = searchParams.get('backend_host');
const backendHost = backendHostParam || DEFAULT_BACKEND_HOST;

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
