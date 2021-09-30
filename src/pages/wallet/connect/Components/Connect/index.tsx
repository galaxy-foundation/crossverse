import React from 'react'
import { Modal, ModalProps } from 'antd'
import classNames from 'classnames'
import Button from '@/components/Button'
import Input from '@/components/Input'
import styles from './index.module.scss'

const prefixCls = 'connect'

const Connect: React.FC<ModalProps> = ({ onOk, ...restProps }) => {
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
                        Connect via MetaMask
                    </div>
                </div>
                <div>to continue using Cross Verse</div>
            </div>
            <Input
                className={styles[`${prefixCls}-input`]}
                circle
                placeholder="Email"
            />
            <Button
                block
                wrapClassName={styles[`${prefixCls}-btn`]}
                type="primary"
                onClick={onOk}
            >
                Sign Up / Login
            </Button>
        </Modal>
    )
}

export default Connect
