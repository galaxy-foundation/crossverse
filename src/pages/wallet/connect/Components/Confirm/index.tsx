import React from 'react'
import { Checkbox, Modal, ModalProps } from 'antd'
import classNames from 'classnames'
import Button from '@/components/Button'
import styles from './index.module.scss'

const prefixCls = 'confirm'

const Confirm: React.FC<ModalProps> = ({ onOk, ...restProps }) => {
    const closeIcon = (
        <img
            className={styles[`${prefixCls}-close`]}
            alt="close"
            src="/images/icons/close.png"
        />
    )

    return (
        <Modal
            closeIcon={closeIcon}
            footer={null}
            width={480}
            wrapClassName={styles[`${prefixCls}`]}
            {...restProps}
        >
            <div
                className={classNames(
                    styles[`${prefixCls}-text`],
                    styles[`${prefixCls}-text-tip`]
                )}
            >
                <div className={styles[`${prefixCls}-text-line`]}>
                    <div className={styles[`${prefixCls}-text-bold`]}>
                        Cross Verse
                    </div>
                    <div>&nbsp;enables</div>
                </div>
                <div>authentication using MetaMask</div>
            </div>
            <div
                className={classNames(
                    styles[`${prefixCls}-text`],
                    styles[`${prefixCls}-text-space`]
                )}
            >
                <div>Your phone or email will be</div>
                <div>used to sign-up or login</div>
            </div>
            <div className={styles[`${prefixCls}-text`]}>
                <div>Your funds will be safeguarded by</div>
                <div>security compliant services</div>
            </div>
            <Button
                block
                wrapClassName={styles[`${prefixCls}-btn`]}
                type="primary"
                onClick={onOk}
            >
                Continue
            </Button>
            <div className={styles[`${prefixCls}-tips`]}>
                <span>By continuing, you agree to Cross Verse’s&nbsp;</span>
                <span>
                    <a className={styles[`${prefixCls}-link`]}>
                        Terms and conditions
                    </a>
                    ,
                </span>
                <a className={styles[`${prefixCls}-link`]}>privacy policy</a>
                <span>, and&nbsp;</span>
                <a className={styles[`${prefixCls}-link`]}>cookies policy</a>
            </div>
            <div className={styles[`${prefixCls}-remember`]}>
                <Checkbox>Don't show this again</Checkbox>
            </div>
        </Modal>
    )
}

export default Confirm
