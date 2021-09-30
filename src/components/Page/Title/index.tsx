import React from 'react'
import classNames from 'classnames'
import styles from './index.module.scss'

interface PageTitleProps {
	className?: string
	fontWeight?: 'Medium' | 'Bold' | 'Bolder'
	level?: number
}

const PageTitle: React.FC<PageTitleProps> = ({className, children, fontWeight}) => {
	return (
		<div className={classNames(styles.pageTitle, className)}>
			<div className={classNames({ [styles.bold]: fontWeight === 'Bold', [styles.bolder]: fontWeight === 'Bolder', [styles.medium]: fontWeight === 'Medium', })}>
				{children}
			</div>
		</div>
	)
}

export default PageTitle
