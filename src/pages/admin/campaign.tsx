import React from 'react'
import { getSession } from 'next-auth/client'
import { Spin, Form, Row, Upload, Button, Input } from 'antd'

import { UploadOutlined } from '@ant-design/icons'
import Page from '@/components/Page'
import PageTitle from '@/components/Page/Title'
import styles from './create.module.scss'

import { call, fromLocalTime, getLocalTime } from '@/utils/helper'
import { getCampaign } from '@/utils/datamodel'

const PAGE_NAME = 'Update drop campaign'

interface CampaignPageProps {
	title: string
	subtitle: string
	lasttime: number
}

const CampaignPage = ({title, subtitle, lasttime}: CampaignPageProps):JSX.Element => {
	const [form] = Form.useForm()
	const [status, setStatus] = React.useState({
		loading: false,
		title,
		subtitle,
		lasttime: getLocalTime(lasttime),
		fileList: [],
		msg: null,
		errmsg: null,
		success: false,
	})
	const refTitle = React.useRef<Input>(null)
	const refSubtitle = React.useRef<Input>(null)
	const refLastTime = React.useRef<Input>(null)

	const changeStatus = (v: any) => setStatus({ ...status, ...v })
	const onFileChange = async (res: any) => {
		const { fileList } = res
		changeStatus({ fileList, errmsg: null })
	}
	const onFinish = async () => {
		const title = status.title.trim()
		const subtitle = status.subtitle.trim()
		const lasttime = fromLocalTime(status.lasttime)
		const file: any = status.fileList.length > 0 ? status.fileList[0] : null
		if (lasttime<lasttime) return changeStatus({ errmsg: 'invalid expiration time' })
		setStatus({ ...status, loading: true })
		const data = await call('/api/admin/campaign', {title, subtitle, lasttime, file: file && file.response || null})
		if (data) {
			if (data.status === 'ok') {
				window.open('/drop', '_self')
			} else {
				changeStatus({ errmsg: data.msg, loading: false })
			}
		}
	}

	return (
		<Page className={styles.post} title={PAGE_NAME}>
			<Spin tip="saving..." size="large" spinning={status.loading}>
				<div className={styles.card}>
					<PageTitle className={styles.title} fontWeight="Medium">
						{PAGE_NAME}
					</PageTitle>
					<Row justify="center">
						<Form className={`${styles.form} ant-col`} form={form} style={{ flex: '1 1 auto' }} onFinish={onFinish}>
							<b>Title</b>
							<Form.Item className={styles.formItem} rules={[{required: true, message: 'Title required'}]}>
								<Input ref={refTitle} placeholder="Title" value={status.title || ''} onChange={(e) => changeStatus({errmsg: null,title: e.target.value })}/>
							</Form.Item>
							<b>Sub Title</b>
							<Form.Item className={styles.formItem} rules={[{required: true, message: 'Sub Title required'}]}>
								<Input ref={refSubtitle} placeholder="Sub Title" value={status.subtitle} onChange={(e) => changeStatus({errmsg: null, subtitle: e.target.value})}/>
							</Form.Item>
							<b>Last Time</b>
							<Form.Item className={styles.formItem} rules={[{required: true, message: 'Last Time required'}]}>
								<Input type="datetime-local" ref={refLastTime} placeholder="Last Time" value={status.lasttime} min={getLocalTime()} onChange={(e) => changeStatus({errmsg: null, lasttime: e.target.value})}/>
							</Form.Item>
							<b>Supportted Format: JPG, PNG: Less than 1.0 MB</b>
							<Form.Item className={styles.formItem} rules={[{required: true, message: 'File required'}]}>
								<Upload listType="picture" action="/api/admin/upload" maxCount={1} fileList={status.fileList} onChange={onFileChange}>
									<Button icon={<UploadOutlined />}>Upload File</Button>
								</Upload>
							</Form.Item>
							<div style={{ color: 'green' }}>{status.msg}</div>
							<div style={{ color: 'red' }}>{status.errmsg}</div>
							<div className={styles.submit}>
								<Button block type="primary" htmlType="submit">
									Submit
								</Button>
							</div>
						</Form>
					</Row>
				</div>
			</Spin>
		</Page>
	)
}
export const getServerSideProps = async ({req}:any) => {
	const session: any = await getSession({ req })
	if (session && session.user) {
		const { id } = session.user
		if (id<100010) {
			const data = await getCampaign()
			return {props: { ...data }}
		}
	}
	return {props: {}}
}
export default CampaignPage
