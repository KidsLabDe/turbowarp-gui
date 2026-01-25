/*
NOTE: this file only temporarily resides in scratch-gui.
Nearly identical code appears in scratch-www, and the two should
eventually be consolidated.
*/

import classNames from 'classnames';
import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';

import MenuBarMenu from './menu-bar-menu.jsx';
import {MenuSection} from '../menu/menu.jsx';
import MenuItemContainer from '../../containers/menu-item.jsx';
import UserAvatar from './user-avatar.jsx';
import dropdownCaret from './dropdown-caret.svg';

import styles from './account-nav.css';

// Backend configuration for GamesLab links
const DEFAULT_BACKEND_HOST = process.env.BACKEND_URL || 'https://localhost:8080';
const getBackendHost = () => {
    if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search);
        return searchParams.get('backend_host') || DEFAULT_BACKEND_HOST;
    }
    return DEFAULT_BACKEND_HOST;
};

const AccountNavComponent = ({
    className,
    isOpen,
    isRtl,
    menuBarMenuClassName,
    onClick,
    onClose,
    thumbnailUrl,
    username
}) => (
    <React.Fragment>
        <div
            className={classNames(
                styles.userInfo,
                className
            )}
            onMouseUp={onClick}
        >
            {thumbnailUrl ? (
                <UserAvatar
                    className={styles.avatar}
                    imageUrl={thumbnailUrl}
                />
            ) : null}
            <span className={styles.profileName}>
                {username}
            </span>
            <div className={styles.dropdownCaretPosition}>
                <img
                    className={styles.dropdownCaretIcon}
                    src={dropdownCaret}
                    draggable={false}
                />
            </div>
        </div>
        <MenuBarMenu
            className={menuBarMenuClassName}
            open={isOpen}
            // note: the Rtl styles are switched here, because this menu is justified
            // opposite all the others
            place={isRtl ? 'right' : 'left'}
            onRequestClose={onClose}
        >
            {/* GamesLab Dashboard Link */}
            <MenuItemContainer href={`${getBackendHost()}/schueler`}>
                <FormattedMessage
                    defaultMessage="My Dashboard"
                    description="Text to link to my dashboard"
                    id="gui.accountMenu.dashboard"
                />
            </MenuItemContainer>
            <MenuSection>
                <MenuItemContainer href={`${getBackendHost()}/api/schueler/logout`}>
                    Abmelden
                </MenuItemContainer>
            </MenuSection>
        </MenuBarMenu>
    </React.Fragment>
);

AccountNavComponent.propTypes = {
    className: PropTypes.string,
    isOpen: PropTypes.bool,
    isRtl: PropTypes.bool,
    menuBarMenuClassName: PropTypes.string,
    onClick: PropTypes.func,
    onClose: PropTypes.func,
    thumbnailUrl: PropTypes.string,
    username: PropTypes.string
};

export default AccountNavComponent;
