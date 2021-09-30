import React, { useState } from 'react'
import { Form, Row } from 'antd'
import Link from 'next/link'
import Input from '@/components/Input'
import Page from '@/components/Page'
import PageTitle from '@/components/Page/Title'
import Submit from '@/components/Input/Submit'
import styles from './index.module.scss'
import { signin } from 'next-auth/client'

const PAGE_NAME = 'Sign In'

const SignInPage: React.FC = () => {
	const [form] = Form.useForm()
	const [status, setStatus] = useState({
		email: '',
		password: '',
	})

	const onFinish = () => {
		signin('login', status)
	}

	return (
		<Page className={styles.login} title={PAGE_NAME}>
			<div className={styles.card}>
				<PageTitle className={styles.title} fontWeight="Medium">
					Sign in before trading
				</PageTitle>
				<Row justify="center">
					<Form className={`${styles.form} ant-col`} form={form} style={{ flex: '1 1 auto' }} onFinish={onFinish} >
						<Form.Item className={styles.formItem} name="email" rules={[ { required: true, message: 'EMail required', }, { type: 'email', message: 'Email should be correct format.', }, ]}>
							<Input circle className={styles.input} placeholder="EMail" value={status.email} onChange={(e) => setStatus({ ...status, email: e.target.value })}/>
						</Form.Item>
						<Form.Item className={styles.formItem} name="password" rules={[{required: true, message: 'Password required'}]}>
							<Submit placeholder="Password" type="password" onSubmit={onFinish} value={status.password} onKeyDown={(e)=>e.keyCode===13 && onFinish()} onChange={(e) => setStatus({ ...status, password: e.target.value }) } >
								SIGN IN
							</Submit>
						</Form.Item>
						<div className={styles.links}>
							<Link href="/reset">
								<a>Forget Password?</a>
							</Link>
							<Link href="/signup">
								<a>SIGN UP</a>
							</Link>
						</div>
					</Form>
				</Row>
			</div>
		</Page>
	)
}

export default SignInPage
