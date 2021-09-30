import React from 'react'
import { Button, Modal, Input } from 'antd'
import { call } from '@/utils/helper'
import useWallet, {
	explorer,
	confirmations as AtLeast,
	validAddress,
} from '@/utils/useWallet'

interface TransferDialogProps {
	visible: boolean
	onClose: () => void
	art: Artwork
}
interface TransferDialogStatus {
	loading: boolean
	quantity: number
	to: string
	toErr: string
	tx: Transaction | null
	confirmations: number
	success: boolean
	errmsg: string
}

const TransferDialog = ({ visible, art, onClose }: TransferDialogProps) => {
	const [status, setStatus] = React.useState<TransferDialogStatus>({
		loading: false,
		quantity: 1,
		to: '',
		toErr: '',
		tx: null,
		confirmations: 0,
		success: false,
		errmsg: '',
	})
	const wallet = useWallet(visible, art?.id)
	const refAddress = React.useRef<Input>(null)

	const onSubmit = async () => {
		let errmsg = ''
		if (wallet.connected) {
			if (!validAddress(status.to)) {
				refAddress.current?.select()
				refAddress.current?.focus()
				return setStatus({ ...status, toErr: '❌ invalid address format' })
			} else {
				setStatus({ ...status, loading: true })
				const res = await call('/api/artwork/' + art.id, {
					action: 'transfer',
					address: wallet.address,
					to: status.to,
					count: status.quantity,
				})
				if (res.status === 'ok') {
					const result = await wallet.transfer(res.msg)
					if (result.success && result.tx) {
						const tx = result.tx
						await call('/api/artwork/' + art.id, {action: 'tx', tx})
						setStatus({ ...status, loading: true, tx })
						const success = await wallet.waitTransaction( tx.txid, AtLeast, (confirmations: number) => {
							setStatus({...status, errmsg: '', loading: true, tx, confirmations})
						})
						setStatus({...status, errmsg: success ? '' : 'Time out', tx, success: !!success, loading: true})
						await call('/api/artwork/' + art.id, {
							action: 'check',
						})
						return window.open('/my/purchased', '_self')
					} else {
						errmsg = result.errmsg || ''
					}
				} else {
					errmsg = res.msg || ''
				}
			}
		} else {
			errmsg = '🦊 Connect to Metamask'
		}
		setStatus({ ...status, loading: false, tx: null, errmsg })
	}
	const onCancel = () => {
		onClose()
	}
	return (
		<Modal
			visible={visible}
			title="Transfer"
			onOk={onSubmit}
			onCancel={onCancel}
			footer={[
				<Button key="connect" type="primary" loading={wallet.connecting} onClick={wallet.connect} style={{ fontSize: 'large', padding: '10px 30px', height: 'auto', display: wallet.connected ? 'none' : '' }}>
					Connect Wallet
				</Button>,
				<Button key="submit" disabled={wallet.balance === 0} type="primary" loading={status.loading || wallet.checkingBalance} onClick={onSubmit} style={{ fontSize: 'large', padding: '10px 30px', height: 'auto', display: !wallet.connected ? 'none' : '', }}>
					SUBMIT
				</Button>,
				<Button key="back" onClick={onCancel} style={{ fontSize: 'large', padding: '10px 30px', height: 'auto', }} >
					CANCEL
				</Button>
			]}
		>
			<h2>
				<b>Item</b>
			</h2>
			<hr />
			<div>
				<h2>{art?.title}</h2>
			</div>
			<div style={{ display: 'flex' }}>
				<div style={{ width: 100, height: 100 }}>
					<img
						alt="thumbnail"
						src={art?.thumbnail || ''}
						style={{ maxWidth: '100%', maxHeight: '100%' }}
					/>
				</div>
				<div style={{ flexGrow: 1, paddingLeft: 20 }}>
					<b>Target Address</b>
					<div>
						<Input ref={refAddress} value={status.to} minLength={44} maxLength={44} onChange={(e) => setStatus({ ...status, toErr: '', to: e.target.value.trim(), }) }/>
					</div>
					<div style={{ color: 'red' }}>{status.toErr}</div>
					<b>Quantity</b>
					<div>
						<Input type="number" value={status.quantity} min={1} max={wallet.balance} step={1} onChange={(e) => setStatus({ ...status, quantity: Math.min( wallet.balance, Number(e.target.value) ) }) } />
					</div>
				</div>
			</div>

			<hr />
			<h2>
				<b>Your Collectibles: </b>{' '}
				{wallet.connected ? (
					wallet.checkingBalance ? (
						<span style={{ color: '#888' }}>
							checking balance...
						</span>
					) : (
						<span style={{ color: wallet.balance < status.quantity ? 'red' : '' }}>
							{wallet.balance + (wallet.balance < status.quantity ? ' (Insufficient tokens in wallet)' : '')}
						</span>
					)
				) : (
					<span style={{ color: '#888' }}>not connected wallet.</span>
				)}
			</h2>
			<h2 style={{ color: 'red' }}>{wallet.err || status.errmsg}</h2>
			{status.tx ? (
				<h2 style={{ textAlign: 'center' }}>
					tx:
					<a href={explorer('tx', status.tx.txid)} target="_blank" style={{ marginRight: 20 }} >
						{status.tx.txid.slice(0, 6) + '...' + status.tx.txid.slice(-4)}
					</a>
					{status.success ? (
						<span style={{ color: 'green' }}>Success</span>
					) : null}
					<div style={{ display: status.success ? 'none' : '' }}>
						<span style={{ color: 'blue' }}>
							Confirmations: {status.confirmations} / {AtLeast}
						</span>
					</div>
				</h2>
			) : null}
		</Modal>
	)
}

export default TransferDialog
