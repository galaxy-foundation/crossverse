import React from 'react'
import classNames from 'classnames'
import styles from './index.module.scss'

const prefixCls = 'header'

interface HeaderProps {
	bordered?: boolean
	collapsed?: boolean
}

const Header: React.FC<HeaderProps> = ({ bordered, collapsed, children }) => (
	<header className={classNames(styles[prefixCls], {[styles[`${prefixCls}-bordered`]]: bordered, [styles[`${prefixCls}-desktop`]]: !collapsed, [styles[`${prefixCls}-mobile`]]: collapsed, })}>
		{children}
	</header>
)

export default Header
