import React from 'react'
import { Form, Row } from 'antd'

import Button from '@/components/Button'
import Input from '@/components/Input'
import Page from '@/components/Page'
import PageTitle from '@/components/Page/Title'

import styles from './index.module.scss'
import { now, call, request } from '../../utils/helper'
import { Helmet } from 'react-helmet'

const PAGE_NAME = 'Sign Up'
let captcha:any = null;

const SignUpPage: React.FC = () => {
	const [form] = Form.useForm()
	const [status, setStatus] = React.useState({
		alias: '',
		email: '',
		password: '',
		confirm: '',
		code: '',
		sent: 0,
		msg: null,
		errmsg: null,
		success: false,
		loading: false,
		geeTest: 0,
		verify:null
	})
	const [time, setTime] = React.useState(now())
	React.useEffect(() => {
		const timer = setTimeout(() => setTime(now()), 1000)
		return () => clearTimeout(timer)
	})
	const changeStatus = (v: any) => setStatus({ ...status, ...v })

	const onCode = async () => {
		if (status.email) {
			setStatus({...status, loading:true})
			const data = await call('/api/auth/code', { email: status.email })
			if (data) {
				if (data.status === 'ok') {
					changeStatus({errmsg: null, loading:false, msg: 'Verification code sent successfully.', sent:time})
				} else {
					changeStatus({ errmsg: data.msg, loading:false })
				}
			} else {
				changeStatus({ errmsg: 'network error', loading:false })
			}
		} else {
			changeStatus({ errmsg: 'First fill out the email field.', loading:false })
		}
	}
	const checkVerify = () => {
		console.log('check verify')
		const verify = captcha.getValidate();
		if (verify) {
			setStatus({...status, geeTest:100, loading:false, verify})
		} else {
			setTimeout(checkVerify, 1000)
		}
	}
	const onSubmit = async () => {
		if (status.geeTest===0) {
			setStatus({...status, geeTest:1, loading:true})
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
						captchaObj.onReady(()=>setStatus({...status, loading:false, geeTest:2}));
						checkVerify();
					});
				} else {
					setStatus({...status, loading:false, geeTest:0})
				}
			})
		} else if (status.geeTest===100) {
			if (status.sent && status.verify) {
				const verify:any = status.verify;
				const data = await call('/api/auth/register', {alias:status.alias, email:status.email, password:status.password, code:status.code, ...verify})
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
						<Form className={`${styles.form} ant-col`} form={form} style={{ flex: '1 1 auto' }} onFinish={onSubmit}>
							<Form.Item style={{display:status.geeTest===100?'none':''}} className={styles.formItem} name="alias" rules={[{required: true, message:'Alias required'}, {message:'alias should be correct format.'}]}>
								<Input circle className={styles.input} placeholder="Display name" value={status.alias || ''} onChange={(e) => changeStatus({errmsg: null, alias: e.target.value.trim()})}/>
							</Form.Item>
							<Form.Item className={styles.formItem} name="email" rules={[{required: true, message: 'Email required'}, {type: 'email', message: 'Email should be correct format.'}]}>
								<Input circle disabled={status.geeTest===100} className={styles.input} placeholder="Email" value={status.email || ''} onChange={(e) => changeStatus({errmsg: null, email: e.target.value.trim()})}/>
							</Form.Item>
							<Form.Item style={{display:status.geeTest===100?'none':''}} className={styles.formItem} name="password" rules={[{required: true, message:'Password required'}]}>
								<Input circle type="password" className={styles.input} placeholder="Password" value={status.password || ''} onChange={(e) => changeStatus({errmsg: null, password: e.target.value.trim()})}/>
							</Form.Item>
							<Form.Item style={{display:status.geeTest===100?'none':''}} className={styles.formItem} name="confirm" rules={[{required: true, message:'password confirm required'}]}>
								<Input circle type="password" className={styles.input} placeholder="Confirm password" value={status.confirm || ''} onChange={(e) => changeStatus({errmsg: null, confirm: e.target.value.trim()})}/>
							</Form.Item>
							<div style={{padding:20, display:status.geeTest!==0?'':'none'}}>
								<div id="captcha" style={{display:status.geeTest===100?'none':''}}>
									{status.geeTest===1?'Loading verification captcha......':null}
								</div>
								<Helmet>
									<script src="/js/gt.js"></script>
								</Helmet>
							</div>
							{status.geeTest===100 ? (
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
							) : null}
							<div style={{ color: 'green' }}>{status.msg}</div>
							<div style={{ color: 'red' }}>{status.errmsg}</div>
							<div className={styles.submit}>
								<Button block type="primary" loading={status.loading} style={{display:status.geeTest===2?'none':''}} htmlType="submit">
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
