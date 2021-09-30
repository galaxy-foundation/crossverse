import React from 'react'
import Head from 'next/head'
import { getPageName } from '@/utils/common'
import classNames from 'classnames'

interface PageProps {
	className?: string
	title?: string
}

const Page: React.FC<PageProps> = ({ children, className, title }) => {
	return (
		<>
			<Head>
				<title>{getPageName(title)}</title>
			</Head>
			<div className={classNames('page', className)}>{children}</div>
		</>
	)
}

export default Page
