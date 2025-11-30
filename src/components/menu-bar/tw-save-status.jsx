import {connect} from 'react-redux';
import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';
import InlineMessages from '../../containers/inline-messages.jsx';
import SB3Downloader from '../../containers/sb3-downloader.jsx';
import {filterInlineAlerts} from '../../reducers/alerts';
import {manualUpdateProject} from '../../reducers/project-state';

import styles from './save-status.css';

const TWSaveStatus = ({
    alertsList,
    canSave,
    fileHandle,
    projectChanged,
    onManualSave,
    showSaveFilePicker
}) => (
    filterInlineAlerts(alertsList).length > 0 ? (
        <InlineMessages />
    ) : projectChanged && (
        canSave ? (
            // Server save when logged in
            <div
                onClick={onManualSave}
                className={styles.saveNow}
            >
                <FormattedMessage
                    defaultMessage="Save project"
                    description="Menu bar item for saving project to server"
                    id="tw.menuBar.saveToServer"
                />
            </div>
        ) : (
            // Local save when not logged in
            <SB3Downloader
                showSaveFilePicker={showSaveFilePicker}
            >
                {(_className, _downloadProjectCallback, {smartSave}) => (
                    <div
                        onClick={smartSave}
                        className={styles.saveNow}
                    >
                        {fileHandle ? (
                            <FormattedMessage
                                defaultMessage="Save as {file}"
                                description="Menu bar item to save project to an existing file on the user's computer"
                                id="tw.menuBar.saveAs"
                                values={{
                                    file: fileHandle.name
                                }}
                            />
                        ) : (
                            <FormattedMessage
                                defaultMessage="Save to your computer"
                                description="Menu bar item for downloading a project to your computer"
                                id="gui.menuBar.downloadToComputer"
                            />
                        )}
                    </div>
                )}
            </SB3Downloader>
        )
    ));

TWSaveStatus.propTypes = {
    alertsList: PropTypes.arrayOf(PropTypes.object),
    canSave: PropTypes.bool,
    fileHandle: PropTypes.shape({
        name: PropTypes.string
    }),
    onManualSave: PropTypes.func,
    projectChanged: PropTypes.bool,
    showSaveFilePicker: PropTypes.func
};

const mapStateToProps = state => ({
    alertsList: state.scratchGui.alerts.alertsList,
    fileHandle: state.scratchGui.tw.fileHandle,
    projectChanged: state.scratchGui.projectChanged
});

const mapDispatchToProps = dispatch => ({
    onManualSave: () => dispatch(manualUpdateProject())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TWSaveStatus);
