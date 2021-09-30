import React from 'react'
import { Button as AButton, ButtonProps as AButtonProps } from 'antd'
import classNames from 'classnames'
import styles from './index.module.scss'

interface ButtonProps extends AButtonProps {
	wrapClassName?: string
}

const prefixCls = 'button'

const Button: React.FC<ButtonProps> = ({className, wrapClassName, ...restProps}) => {
	return (
		<div className={classNames(styles.button, wrapClassName)}>
			<AButton
				className={classNames(className, styles[`${prefixCls}-btn`])}
				{...restProps}
			/>
		</div>
	)
}

export default Button
