import React from 'react'
import { Button, Input, Modal } from 'antd'

import { call } from '@/utils/helper'

import useWallet, {
	explorer,
	confirmations as AtLeast,
} from '@/utils/useWallet'

interface MakeOfferProps {
	onClose: () => void
	onUpdate: (data: Array<OfferWithArt>) => void
	art: Artwork
	visible: boolean
	ethPrice: number
}
interface MakeOfferStatus {
	loading: boolean
	price: number
	quantity: number
	amount: number
	tx: Transaction | null
	confirmations: number
	success: boolean
	errmsg: string
}

const MakeOffer: React.FC<MakeOfferProps> = ({visible, art, onClose, onUpdate}) => {
	let price = art?.price || 0
	const auction = art?.auction && art?.drop
	if (auction) {
		price = Number((price + price * 0.05).toFixed(6))
	}
	const [status, setStatus] = React.useState<MakeOfferStatus>({
		loading: false,
		price,
		quantity: 1,
		amount: price,
		tx: null,
		confirmations: 0,
		success: false,
		errmsg: '',
	})

	const wallet = useWallet(visible)
	const setPrice = (price: number) => {
		setStatus({ ...status, price, amount: price * status.quantity })
	}
	const setQuantity = (quantity: number) => {
		setStatus({ ...status, quantity, amount: status.price * quantity })
	}
	const onSubmit = async () => {
		if (wallet.connected) {
			if (auction && status.price < price) {
				return setStatus({ ...status, errmsg: 'too cheap price >=' + price})
			}
			setStatus({ ...status, loading: true })
			const result = await wallet.approve(
				Number(status.amount.toFixed(6))
			)
			if (result.success && result.tx) {
				const tx = result.tx
				await call('/api/artwork/' + art.id, {
					action: 'offer',
					address: wallet.address,
					tx: result.tx,
					offer: {
						tokenid: art.id,
						price: status.price,
						quantity: status.quantity,
						amount: status.amount,
					},
				})
				setStatus({ ...status, loading: true, tx })
				const success = await wallet.waitTransaction( tx.txid, AtLeast, (confirmations: number) => {
					setStatus({ ...status, errmsg: '', loading: true, tx, confirmations })
				})
				setStatus({ ...status, errmsg: success ? '' : 'Time out', tx, success: !!success, loading: true })

				let res = (await call('/api/artwork/' + art.id, {action: 'check'})) as ApiResponse
				if (res.status === 'ok') {
					res = (await call('/api/artwork/' + art.id, {action: 'offers',})) as ApiResponse
					if (res.status === 'ok') {
						onUpdate(res.msg)
					}
				}
			} else {
				setStatus({ ...status, loading: false, tx: null, errmsg: result.errmsg || '' })
			}
		} else {
			setStatus({ ...status, loading: false, tx: null, errmsg: '🦊 Connect to Metamask', })
		}
	}
	const onCancel = () => {
		onClose()
	}
	return (
		<Modal visible={visible} title="Make an offer" onOk={onSubmit} onCancel={onCancel}
			footer={[
				<Button key="connect" type="primary" loading={wallet.connecting} onClick={wallet.connect} style={{fontSize: 'large', padding: '10px 30px', height: 'auto', display: wallet.connected ? 'none' : ''}}>
					Connect Wallet
				</Button>,
				<Button key="submit" disabled={wallet.checkingBalance || wallet.WETH < status.amount || status.quantity === 0} type="primary" loading={wallet.checkingBalance || status.loading} onClick={onSubmit} style={{fontSize: 'large', padding: '10px 30px', height: 'auto', display: !wallet.connected ? 'none' : ''}}>
					SUBMIT
				</Button>,
				<Button key="back" onClick={onCancel} style={{fontSize: 'large', padding: '10px 30px', height: 'auto'}}>
					CANCEL
				</Button>,
		]}>
			<h2>
				<b>Item</b>
			</h2>
			<hr />
			<div>
				<h2>{art?.title}</h2>
			</div>
			<div style={{ display: 'flex' }}>
				<div style={{ width: 100, height: 100 }}>
					<img alt="thumbnail" src={art?.thumbnail || ''} style={{ maxWidth: '100%', maxHeight: '100%' }}/>
				</div>
				<div style={{ flexGrow: 1, paddingLeft: 20 }}>
					<b>Quantity</b>
					<div>
						<Input type="number" value={status.quantity} min={1} max={art?.drop?(art?.instock||0):10000} step={1} onChange={(e) => setQuantity(Math.min(Number(e.target.value), 10000))}/>
					</div>
					<b>Price</b>
					<div>
						<Input type="number" value={status.price} min={auction ? price : 0.001} max={10000} step={0.0001} onChange={(e) => setPrice(Number(e.target.value))} />
					</div>
					<b>Amount</b>
					<h3>{Number(status.amount.toFixed(6))} ETH</h3>
				</div>
			</div>

			<hr />
			<h2>
				<b>Your balance: </b>{' '}
				{wallet.connected ? (
					wallet.checkingBalance ? (
						<span style={{ color: '#888' }}>
							checking balance...
						</span>
					) : (
						<span style={{ color: wallet.WETH < status.amount ? 'red' : '' }}>
							{Number(wallet.WETH.toFixed(6)) + ' WETH ' + (wallet.WETH < status.amount ? ' (Insufficient balance)' : '')}
						</span>
					)
				) : (
					<span style={{ color: '#888' }}>not connected wallet.</span>
				)}
			</h2>
			<h2 style={{ color: 'red' }}>{wallet.err || status.errmsg}</h2>
			{status.tx ? (
				<h2 style={{ textAlign: 'center' }}>
					tx:{' '}
					<a href={explorer('tx', status.tx.txid)} target="_blank" style={{ marginRight: 20 }}>
						{status.tx.txid.slice(0, 6) + '...' + status.tx.txid.slice(-4)}
					</a>
					{status.success ? <span style={{ color: 'green' }}>Success</span> : null}
					<div style={{ display: status.success ? 'none' : '' }}>
						<span style={{ color: 'blue' }}>
							Confirmations: {status.confirmations} / {AtLeast}
						</span>
					</div>
				</h2>
			) : null}
			<h2 style={{ color: '#faad14' }}>
				WETH must used to make an offer.
			</h2>
		</Modal>
	)
}

export default MakeOffer
