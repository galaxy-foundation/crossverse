import React from 'react'
import { useRouter } from 'next/router'
import { Grid, Layout, Divider } from 'antd'
import classNames from 'classnames'
import Header from './components/Header'
import Links from './components/Links'
import NavBar from './components/NavBar'
import Subscribe from './components/Subscribe'
import { COPYRIGHT, FOOTER_LINKS } from '@/config'
import styles from './index.module.scss'

const { Content, Footer } = Layout
const { useBreakpoint } = Grid

interface LayoutProps {
	followStyle?: 'normal' | 'simple'
}

const LayoutComponent: React.FC<LayoutProps> = ({ children }) => {
	const screens = useBreakpoint()
	const router = useRouter()
	const isMobile = screens.xs
	const isDesktop = !isMobile

	/**
	 * 显示简介版的订阅提示
	 */
	const isSimpleSubscribe = () => {
		const includePaths = ['/signup']
		return includePaths.indexOf(router.pathname) > -1
	}

	/**
	 * 显示 Header 边框
	 */
	const isShowHeaderBorder = () => {
		if (isDesktop) {
			return false
		}

		const includePaths = ['/', '/drop', '/signin']
		return includePaths.indexOf(router.pathname) < 0
	}

	const getLinkSize = () => {
		if (isDesktop) {
			return 'block'
		}

		const includePaths = ['/signup']
		return includePaths.indexOf(router.pathname) > -1 ? 'block' : 'wrap'
	}

	const childrenWithProps = React.Children.map(children, (child) => {
		if (React.isValidElement(child)) {
			return React.cloneElement(child, {
				isDesktop,
				isMobile,
			})
		}
		return child
	})

	return (
		<Layout className={classNames('container', styles.layout)}>
			<Header bordered={isShowHeaderBorder()} collapsed={isMobile}>
				<NavBar collapsed={isMobile} search={screens.xl} />
			</Header>
			<Content>{childrenWithProps}</Content>
			<Footer className={styles['layout-footer']}>
				<Subscribe simple={isSimpleSubscribe()} />
				<Links layout={getLinkSize()} links={FOOTER_LINKS} />
				<Divider className={styles['layout-footer-divider']} />
				<div className={styles['layout-footer-copyright']}>{COPYRIGHT}</div>
			</Footer>
		</Layout>
	)
}

export default LayoutComponent
