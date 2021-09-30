import React, { useState, useEffect } from 'react'
import { Form, Row } from 'antd'

import Button from '@/components/Button'
import Input from '@/components/Input'
import Password from '@/components/Input/Password'
import Page from '@/components/Page'
import PageTitle from '@/components/Page/Title'

import styles from './index.module.scss'
import { now, call } from '../../utils/helper'

const PAGE_NAME = 'Sign Up'

const SignUpPage: React.FC = () => {
	const [form] = Form.useForm()
	const [status, setStatus] = useState({
		alias: '',
		email: '',
		password: '',
		phone: '',
		code: '',
		sent: 0,
		msg: null,
		errmsg: null,
		success: false,
	})
	const [time, setTime] = useState(now())
	useEffect(() => {
		const timer = setTimeout(() => setTime(now()), 1000)
		return () => clearTimeout(timer)
	})
	const changeStatus = (v: any) => setStatus({ ...status, ...v })

	const onCode = async () => {
		if (status.email) {
			const data = await call('/api/auth/code', { email: status.email })
			if (data) {
				if (data.status === 'ok') {
					changeStatus({errmsg: null, msg: 'Verification code sent successfully.', sent:time})
				} else {
					changeStatus({ errmsg: data.msg })
				}
			} else {
				changeStatus({ errmsg: 'network error' })
			}
		} else {
			changeStatus({ errmsg: 'First fill out the email field.' })
		}
	}
	const onFinish = async () => {
		if (status.sent) {
			const data = await call('/api/auth/register', {alias:status.alias, email:status.email, password:status.password, phone:status.phone, code:status.code})
			if (data) {
				if (data.status === 'ok') {
					changeStatus({ errmsg: null, success: true })
				} else {
					changeStatus({ errmsg: data.msg })
				}
			}
		} else {
			changeStatus({errmsg:'Click the [Get code] button to send the verification code first.'})
		}
	}

	return (
		<Page className={styles.register} title={PAGE_NAME}>
			<div className={styles.card}>
				<PageTitle className={styles.title} fontWeight="Medium">
					Sign up before trading
				</PageTitle>
				{status.success ? (
					<div style={{ textAlign: 'center' }}>
						<div style={{ marginTop: 20, marginBottom: 20 }}>
							<h1 style={{ color: 'green' }}>Congratulation!</h1>
							<h2 style={{ color: 'green' }}>
								You are already a member of CrossVerse.
							</h2>
						</div>
						<Button type="primary" href="/signin">
							Join now!
						</Button>
					</div>
				) : (
					<Row justify="center">
						<Form className={`${styles.form} ant-col`} form={form} style={{ flex: '1 1 auto' }} onFinish={onFinish}>
							<Form.Item className={styles.formItem} name="alias" rules={[{required: true, message:'Alias required'}, {message:'alias should be correct format.'}]}>
								<Input circle className={styles.input} placeholder="Display name" value={status.alias || ''} onChange={(e) => changeStatus({errmsg: null, alias: e.target.value.trim()})}/>
							</Form.Item>
							<Form.Item className={styles.formItem} name="email" rules={[{required: true, message: 'Email required'}, {type: 'email', message: 'Email should be correct format.'}]}>
								<Input circle className={styles.input} placeholder="Email" value={status.email || ''} onChange={(e) => changeStatus({errmsg: null, email: e.target.value.trim()})}/>
							</Form.Item>
							<Form.Item className={styles.formItem} name="password" rules={[{required: true, message:'Password required'}]}>
								<Password circle className={styles.input} placeholder="Password" value={status.password || ''} onChange={(e) => changeStatus({errmsg: null,password: e.target.value.trim()})}/>
							</Form.Item>
							<Form.Item className={styles.formItem} name="mobile" rules={[{required: true, message: 'Mobile required'}]}>
								<Input circle className={styles.input} placeholder="Mobile phone No." value={status.phone || ''} onChange={(e) => changeStatus({errmsg: null, phone: e.target.value.trim()})}/>
							</Form.Item>
							<Form.Item className={styles.formItem} name="verifyCode" rules={[{required: true, message:'Verification code required'}]}>
								<div className={styles.emailverify}>
									<Input circle className={styles.input} placeholder="Email verification code." value={status.code || ''} onChange={(e) => changeStatus({errmsg: null, code: e.target.value.trim()})}/>
									{status.sent && time - status.sent < 60 ? (
										<Button className={styles.btn}>
											<span className={styles.icon}>
												<img alt="arrow" src="/images/arrow.png" />
											</span>
											{60 - (time - status.sent < 0 ? 0 : time - status.sent)}s
										</Button>
									) : (
										<Button className={styles.btn} onClick={() => onCode()}>
											<span className={styles.icon}>
												<img alt="arrow" src="/images/arrow.png" />
											</span>
											Get code
										</Button>
									)}
								</div>
							</Form.Item>
							<div style={{ color: 'green' }}>{status.msg}</div>
							<div style={{ color: 'red' }}>{status.errmsg}</div>
							<div className={styles.submit}>
								<Button block type="primary" htmlType="submit">
									Sign Up
								</Button>
							</div>
						</Form>
					</Row>
				)}
			</div>
		</Page>
	)
}

export default SignUpPage
