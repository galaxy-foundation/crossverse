import React from 'react'
import { Input as AInput, InputProps as AInputProps } from 'antd'
import classNames from 'classnames'
import styles from './index.module.scss'

interface InputProps extends AInputProps {
	circle?: boolean
}

const prefixCls = 'input'

const Input: React.FC<InputProps> = ({addonBefore, className, circle, ...restProps}) => {
	return (
		<AInput.Password className={classNames(className, styles[prefixCls], { [styles[`${prefixCls}-circle`]]: circle, [styles[`${prefixCls}-group`]]: addonBefore, })} addonBefore={addonBefore} {...restProps} />
	)
}

export default Input
