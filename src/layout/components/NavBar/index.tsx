import React, { useState } from 'react'
import { Button, Image } from 'antd'
import LinkWrap from '@/components/LinkWrap'
import Nav from '../Nav'
import Search from '../Search'
import styles from './index.module.scss'

const prefixCls = 'navbar'

interface NavBarProps {
	collapsed?: boolean
	search?: boolean
}

const NavBar: React.FC<NavBarProps> = ({ collapsed, search }) => {
	const [expand, setExpand] = useState(false)

	return (
		<nav className={styles[prefixCls]}>
			<div className={styles[`${prefixCls}-brand`]}>
				<LinkWrap href="/">
					<Image className={styles[`${prefixCls}-brand-image`]} alt="brand" preview={false} src="/images/logo.png" />
				</LinkWrap>
			</div>
			{search && (
				<div className={styles[`${prefixCls}-search`]}>
					<Search placeholder="Search" />
				</div>
			)}
			{collapsed && (
				<Button className={styles[`${prefixCls}-expand`]} onClick={() => setExpand(!expand)} >
					<img className={styles[`${prefixCls}-expand-icon`]} alt="toggle" src="/images/menu.png" />
				</Button>
			)}
			<Nav collapsed={collapsed} expand={expand} />
		</nav>
	)
}

export default NavBar
