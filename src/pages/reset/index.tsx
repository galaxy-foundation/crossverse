import React from 'react'
import { Form, Row } from 'antd'
import Link from 'next/link'
import Page from '@/components/Page'
import PageTitle from '@/components/Page/Title'
import styles from './index.module.scss'
import { call, request } from '../../utils/helper'
import { Helmet } from 'react-helmet'
import Button from '@/components/Button'
import Input from '@/components/Input'

const PAGE_NAME = 'Reset password'

let captcha:any = null;

const ResetPasswordPage: React.FC = () => {
	const [form] = Form.useForm()
	const [status, setStatus] = React.useState({
		email: '',
		sent: false,
		errmsg: null,
		geeTest: 0
	})

	const changeStatus = (v: any) => setStatus({ ...status, ...v })

	/* const onFinish = async () => {
		if (status.email.length) { 
			const data = await call('/api/auth/reset', {email:status.email})
			if (data) {
				if (data.status === 'ok') {
					changeStatus({ sent:true })
				} else {
					changeStatus({ errmsg: data.msg })
				}
			}
		}
	} */
	const checkVerify = async () => {
		console.log('check verify')
		const result = captcha.getValidate();
		if (result) {
			setStatus({...status, geeTest:100})
			const data = await call('/api/auth/reset', {email:status.email, ...result})
			if (data) {
				if (data.status === 'ok') {
					changeStatus({ sent:true })
				} else {
					changeStatus({ errmsg: data.msg })
				}
			}
		} else {
			setTimeout(checkVerify, 1000)
		}
	}
	const onSubmit = () => {
		setStatus({...status, geeTest:1})
		request("/api/auth/captcha?t=" + (new Date()).getTime()).then(data=>{
			if (data) {
				const {initGeetest} = window;
				initGeetest({
					gt: data.gt,
					challenge: data.challenge,
					new_captcha: data.new_captcha, // 用于宕机时表示是新验证码的宕机
					offline: !data.success, // 表示用户后台检测极验服务器是否宕机，一般不需要关注
					product: "float", // 产品形式，包括：float，popup, 
					lang: 'en',
					width: "100%"
				}, (captchaObj:any) => {
					captcha = captchaObj;
					captchaObj.appendTo("#captcha");
					captchaObj.onReady(()=>setStatus({...status, geeTest:2}));
					checkVerify();
				});
			} else {
				setStatus({...status, geeTest:0})
			}
		})
	}

	return (
		<Page className={styles.reset} title={PAGE_NAME}>
			<div className={styles.card}>
				<PageTitle className={styles.title} fontWeight="Medium">
					Send password reset email
				</PageTitle>
				<Row justify="center">
					{status.sent ? (
						<div>
							<h3 style={{ color: 'green' }}>You have submitted a password reset request.</h3>
							<h3>Please check your email.</h3>
						</div>
					) : (
						<Form className={`${styles.form} ant-col`} form={form} style={{ flex: '1 1 auto' }} onFinish={onSubmit}>
							<Form.Item className={styles.formItem} name="email" rules={[{required: true, message: 'Email required'}, {type: 'email', message: 'Email should be correct format.'}]}>
								<Input disabled={status.geeTest!==0} circle className={styles.input} placeholder="EMail" value={status.email} onChange={(e:any) => changeStatus({errmsg: null, email: e.target.value.trim()})} />
							</Form.Item>
							<div style={{padding:20, display:status.geeTest!==0?'':'none'}}>
								<div id="captcha">
									{status.geeTest===1?'Loading verification captcha......':null}
								</div>
								<Helmet>
									<script src="/js/gt.js"></script>
								</Helmet>	
							</div>
							<div style={{marginTop:20, marginBottom:20}}>
								<Button style={{width:'100%', display:status.geeTest>1?'none':''}} loading={status.geeTest===1}  type="primary" htmlType="submit">
									RESET
								</Button>
							</div>
							<div style={{ color: 'red', fontSize:20, padding:10 }}>{status.errmsg}</div>
							<div className={styles.links}>
								<Link href="/signup">
									<a>Sign Up</a>
								</Link>
							</div>
						</Form>
					)}
					
				</Row>
			</div>
		</Page>
	)
}

export default ResetPasswordPage
