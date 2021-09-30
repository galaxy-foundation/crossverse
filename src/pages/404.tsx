import React from 'react'
import { Typography } from 'antd'
import Page from '@/components/Page'
import styles from './index.module.scss'

const { Title } = Typography

const PAGE_NAME = '404'

const NotFoundPage: React.FC = () => {
	return (
		<Page className={styles.notFound} title={PAGE_NAME}>
			<Title className={styles.title} level={2}>
				Page Not Found
			</Title>
		</Page>
	)
}

export default NotFoundPage
