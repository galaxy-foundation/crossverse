import React from 'react'
import { Input } from 'antd'
import { TextAreaProps as ATextAreaProps } from 'antd/es/input'
import classNames from 'classnames'
import styles from './index.module.scss'

interface TextAreaProps extends ATextAreaProps {
	className?: string
}

const prefixCls = 'input'

const TextArea: React.FC<TextAreaProps> = ({ className, ...restProps }) => {
	return (
		<Input.TextArea className={classNames(className, styles[`${prefixCls}`], {[styles[`${prefixCls}-padding`]]: true})} {...restProps}/>
	)
}

export default TextArea
