import * as React from 'react'
import LinkWrap from '@/components/LinkWrap'
import classNames from 'classnames'
import styles from './index.module.scss'

interface MoreProps {
	className?: string
	href: string
}

const More: React.FC<MoreProps> = ({ children, className, href }) => {
	return (
		<div className={classNames(styles.more, className)}>
			<div className={styles.wrap}>
				<LinkWrap href={href}>
					<img className={styles.icon} src="/images/arrow.png" alt="arrow" />
					<span className={styles.text}>{children}</span>
				</LinkWrap>
			</div>
		</div>
	)
}

export default More
