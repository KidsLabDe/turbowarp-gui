import React from 'react';
import {isScratchDesktop} from '../../lib/isScratchDesktop';
import CloseButton from '../close-button/close-button.jsx';
import styles from './tw-news.css';

class TWNews extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            closed: false
        };
        this.handleClose = this.handleClose.bind(this);
    }
    handleClose () {
        this.setState({
            closed: true
        });
        window.dispatchEvent(new Event('resize'));
    }
    render () {
        if (this.state.closed || isScratchDesktop()) {
            return null;
        }
        return (
            <div className={styles.news}>
                <div className={styles.text}>
                    {/* eslint-disable-next-line max-len */}
                    {`This experiment uses the old compiler and will not receive updates. Don't use if not necessary. `}
                    <a
                        href="https://docs.turbowarp.org/new-compiler"
                        target="_blank"
                        rel="noreferrer"
                    >
                        {'Learn more.'}
                    </a>
                </div>
                <CloseButton
                    className={styles.close}
                    onClick={this.handleClose}
                />
            </div>
        );
    }
}

export default TWNews;
