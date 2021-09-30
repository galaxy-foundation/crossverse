import React, { useState } from 'react'
import { getSession } from 'next-auth/client'
import { Avatar, Col, Form, Row, Switch } from 'antd'
import classNames from 'classnames'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Page from '@/components/Page'
import PageTitle from '@/components/Page/Title'
import TextArea from '@/components/Input/TextArea'
import styles from './index.module.scss'

import { getAccount } from '@/utils/datamodel'
import { call, validURL } from '@/utils/helper'

const PAGE_NAME = 'Account Setting'

interface AccountProps {
	isDesktop: boolean
	isMobile: boolean
	data: Account | null
}

const MyAccountPage = ({ isDesktop, isMobile, data }: AccountProps):JSX.Element => {
	const { email, alias, subscribe, twitter, facebook, about } = data || {}
	const [status, setStatus] = useState({
		alias,
		subscribe,
		twitter,
		facebook,
		about,
		loading: false,
		success: false,
		errmsg: '',

		oldpass: '',
		newpass: '',
		confirmpass: '',
		
		loadingPassword: false,
		successPassword: false,
		errmsgPassword:''
	})

	const [form] = Form.useForm()
	const [formPassword] = Form.useForm()

	const onFinish = async () => {
		if (!status.alias) return setStatus({ ...status, errmsg:'Requires display name' })
		if (status.twitter && !validURL(status.twitter)) return setStatus({ ...status, errmsg:'Requires valid url' })
		if (status.facebook && !validURL(status.facebook)) return setStatus({ ...status, errmsg:'Requires valid url' })

		setStatus({ ...status, loading: true })
		const result = await call('/api/my/account', {
			alias:status.alias, 
			about:status.about, 
			subscribe:status.subscribe, 
			twitter:status.twitter, 
			facebook:status.facebook
		})
		if (result) {
		 	if (result.status === 'ok') {
				setStatus({ ...status, success:true, errmsg:'', loading:false })
			} else {
				setStatus( { ...status, errmsg:result.msg, loading:false } )
			}
		} else {
			setStatus( { ...status, errmsg:'network issue', loading:false } )
		}
	}
	const onUpdatePassword = async () => {
		if (!status.oldpass) return setStatus({ ...status, errmsgPassword:'Requires current password' })
		if (!status.newpass) return setStatus({ ...status, errmsgPassword:'Requires new password' })
		if (!status.confirmpass) return setStatus({ ...status, errmsgPassword:'Requires confirm password' })
		if (status.oldpass===status.newpass) return setStatus({ ...status, errmsgPassword:'The new password is the same as the old.' })
		if (status.newpass!==status.confirmpass) return setStatus({ ...status, errmsgPassword:'The new password does not match the confirm password.' })

		setStatus({ ...status, loadingPassword: true })
		const result = await call('/api/my/password', {
			oldpass: status.oldpass,
			newpass: status.newpass,
			confirmpass: status.confirmpass
		})
		if (result) {
		 	if (result.status === 'ok') {
				setStatus({ ...status, successPassword:true, errmsgPassword:'', loadingPassword:false })
			} else {
				setStatus( { ...status, errmsgPassword:result.msg, loadingPassword:false } )
			}
		} else {
			setStatus( { ...status, errmsgPassword:'network issue', loadingPassword:false } )
		}
	}

	return (
		<Page className={styles.account} title={PAGE_NAME}>
			<PageTitle className={styles.title} fontWeight="Bold">
				{PAGE_NAME}
			</PageTitle>

			<Row
				className={styles.card}
				justify={isDesktop ? 'start' : 'center'}
				wrap={isMobile}
			>
				<Col className={styles.avatar} flex="220px">
					<Avatar size={220} style={{ fontSize: 100 }}>
						{email ? email.slice(0, 2).toUpperCase() : '--'}
					</Avatar>
				</Col>
				<Col className={styles.form} flex="auto">
					<Form
						form={form}
						layout="vertical"
						requiredMark={false}
						onFinish={onFinish}
					>
						<Form.Item
							className={styles['form-item']}
							label="Email address"
							rules={[
								{
									required: true,
									message: 'Please input your email address',
									type: 'email',
								},
							]}
						>
							<Input
								className={styles.input}
								value={email || '-'}
								disabled={true}
							/>
						</Form.Item>
						<Form.Item
							className={styles['form-item']}
							label="Display Name *"
							rules={[
								{
									required: true,
									message: 'Please input your username',
								},
							]}
						>
							<Input
								className={styles.input}
								value={status.alias || ''}
								onChange={(e) =>
									setStatus({
										...status,
										alias: e.target.value.trim(),
									})
								}
							/>
						</Form.Item>
						{/* <Form.Item className={styles['form-item']} label="Wallet address">
							<Input className={styles.input} value={address} disabled={true} />
						</Form.Item>
						{ address!=='' ? null : (
							<div style={{textAlign:'right'}}>
								<a href="/wallet/connect">Connect Wallet</a>
							</div>
						) } */}
						
						<Form.Item className={styles['form-item']} label="About">
							<TextArea
								rows={5}
								value={status.about || ''}
								onChange={(e) =>
									setStatus({
										...status,
										about: e.target.value,
									})
								}
							/>
						</Form.Item>
						<Form.Item label="Social Media">
							<Form.Item>
								<Input
									addonBefore="Twitter"
									value={status.twitter || ''}
									onChange={(e) =>
										setStatus({
											...status,
											twitter: e.target.value.trim(),
										})
									}
								/>
							</Form.Item>
							<Form.Item>
								<Input
									addonBefore="Facebook"
									value={status.facebook || ''}
									onChange={(e) =>
										setStatus({
											...status,
											facebook: e.target.value.trim(),
										})
									}
								/>
							</Form.Item>
						</Form.Item>
						<Form.Item className={styles.subscribe} label="Email Subscription">
							{isDesktop ? (
								<Row wrap={false}>
									<Col flex="150px">
										<Form.Item name="subscription">
											<Switch
												checked={!!status.subscribe}
												onChange={(e) =>
													setStatus({
														...status,
														subscribe: e,
													})
												}
											/>
										</Form.Item>
									</Col>
									<Col className={styles['subscribe-content']} flex="auto">
										<div
											className={classNames(
												styles['subscribe-status'],
												styles['subscribe-text-disabled']
											)}
										>
											{status.subscribe ? 'Enabled' : 'Disabled'}
										</div>
										{!status.subscribe && (
											<div
												className={classNames(
													styles['subscribe-text'],
													styles['subscribe-text-disabled']
												)}
											>
												(You will not receive ANY email from Cross Verse,
												including important ones related to your account
												security or purchases)
											</div>
										)}
									</Col>
								</Row>
							) : (
								<>
									<Row>
										<Col flex="112px">
											<Form.Item name="subscription">
												<Switch
													checked={!!status.subscribe}
													onChange={(e) =>
														setStatus({
															...status,
															subscribe: e,
														})
													}
												/>
											</Form.Item>
										</Col>
										<Col className={styles['subscribe-content']} flex="auto">
											<div
												className={classNames(
													styles['subscribe-status'],
													styles['subscribe-text-disabled']
												)}
											>
												{status.subscribe ? 'Enabled' : 'Disabled'}
											</div>
										</Col>
									</Row>
									{!status.subscribe && (
										<Row>
											<Col flex="auto">
												<div
													className={classNames(
														styles['subscribe-text'],
														styles['subscribe-text-disabled']
													)}
												>
													(You will not receive ANY email from Cross Verse,
													including important ones related to your account
													security or purchases)
												</div>
											</Col>
										</Row>
									)}
								</>
							)}
						</Form.Item>
						<div style={{textAlign:'center'}}>
							<Button className={styles.btnSave} loading={status.loading} type="primary" htmlType="submit">
								Save
							</Button>
						</div>
						<div style={{marginTop:50}}>
							{status.errmsg ? <h1 style={{ color: 'red' }}>{status.errmsg}</h1> : null}
							{status.success ? <h1 style={{ color: 'green' }}>Your account settings updated successfully.</h1> : null}
						</div>
					</Form>
					<Form
						form={formPassword}
						layout="vertical"
						requiredMark={false}
						style={{marginTop:100}}
						onFinish={onUpdatePassword}
					>
						<Form.Item className={styles.password} label="Change Password">
							<Form.Item name="oldPassword">
								<Input
									type="password"
									className={styles.input}
									placeholder="Old Password"
									value={status.oldpass}
									onChange={(e) =>
										setStatus({
											...status,
											oldpass: e.target.value.trim(),
										})
									}
								/>
							</Form.Item>
							<Form.Item name="newPassword">
								<Input
									type="password"
									className={styles.input}
									placeholder="New Password"
									value={status.newpass}
									onChange={(e) =>
										setStatus({
											...status,
											newpass: e.target.value.trim(),
										})
									}
								/>
							</Form.Item>
							<Form.Item name="reNewPassword">
								<Input
									type="password"
									className={styles.input}
									placeholder="Re-type new password"
									value={status.confirmpass}
									onChange={(e) =>
										setStatus({
											...status,
											confirmpass: e.target.value.trim(),
										})
									}
								/>
							</Form.Item>
						</Form.Item>
						<div style={{textAlign:'center'}}>
							<Button className={styles.btnSave} loading={status.loadingPassword}  type="primary" htmlType="submit">
								Update password
							</Button>
						</div>
						<div style={{marginTop:50}}>
							{status.errmsgPassword ? <h1 style={{ color: 'red' }}>{status.errmsgPassword}</h1> : null}
							{status.successPassword ? <h1 style={{ color: 'green' }}>Your password updated successfully.</h1> : null}
						</div>
					</Form>
				</Col>
			</Row>
		</Page>
	)
}

export async function getServerSideProps({ req }: any) {
	const session: any = await getSession({ req })
	if (session && session.user) {
		const { id } = session.user
		const data = await getAccount(id)
		return { props: { data } }
	}
	return { props: { data: null } }
}

export default MyAccountPage
