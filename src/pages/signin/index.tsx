import React from 'react'
import { Form, Row } from 'antd'
import Link from 'next/link'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Page from '@/components/Page'
import PageTitle from '@/components/Page/Title'
import styles from './index.module.scss'
import { signin } from 'next-auth/client'
import { request } from '@/utils/helper'
import { Helmet } from 'react-helmet'

/* import * as utils from './utils.js';  */

const PAGE_NAME = 'Sign In'

let captcha:any = null;

const SignInPage: React.FC = () => {
	const [form] = Form.useForm()
	const [status, setStatus] = React.useState({
		email: '',
		password: '',
		geeTest: 0
	})

	const checkVerify = () => {
		console.log('check verify')
		const result = captcha.getValidate();
		if (result) {
			setStatus({...status, geeTest:100})
			signin('login', {
				email: status.email,
				password: status.password,
				...result
			})
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
		<Page className={styles.login} title={PAGE_NAME}>
			
			<div className={styles.card}>
				<PageTitle className={styles.title} fontWeight="Medium">
					Sign in before trading
				</PageTitle>
				<Row justify="center">
					<Form className={`${styles.form} ant-col`} form={form} style={{ flex: '1 1 auto' }} onFinish={onSubmit} >
						<Form.Item className={styles.formItem} name="email" rules={[ { required: true, message: 'EMail required', }, { type: 'email', message: 'Email should be correct format.', }, ]}>
							<Input disabled={status.geeTest!==0} circle className={styles.input} placeholder="EMail" value={status.email} onChange={(e) => setStatus({ ...status, email: e.target.value })}/>
						</Form.Item>
						<Form.Item className={styles.formItem} name="password" rules={[{required: true, message: 'Password required'}]}>
							<Input disabled={status.geeTest!==0} circle className={styles.input}  placeholder="Password" type="password" value={status.password} onKeyDown={(e)=>e.keyCode===13 && onSubmit()} onChange={(e) => setStatus({ ...status, password: e.target.value }) } />
						</Form.Item>
						<div style={{padding:20, display:status.geeTest!==0?'':'none'}}>
							<div id="captcha">
								{status.geeTest===1?'Loading verification captcha......':null}
							</div>
							<Helmet>
								<script src="/js/gt.js"></script>
							</Helmet>	
						</div>
						<div style={{marginTop:20, marginBottom:50}}>
							<Button style={{width:'100%', display:status.geeTest>1?'none':''}} loading={status.geeTest===1}  type="primary" htmlType="submit">
								Login
							</Button>
						</div>
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
