import React from 'react'
import { Button, Modal, Input } from 'antd'

import { call } from '@/utils/helper'
import useWallet, { explorer, confirmations as AtLeast } from '@/utils/useWallet'

interface CheckoutSellProps {
	onClose: () => void
	onUpdate: (data:Array<OfferWithArt>) =>void
	art: Artwork
	visible: boolean
	ethPrice: number
	args:{id:number|string,price:number,quantity:number}
}
interface CheckoutSellStatus {
	loading: boolean
	quantity: number
	tx: Transaction | null
	confirmations: number
	success: boolean
	errmsg: string
}

const CheckoutSell: React.FC<CheckoutSellProps> = ({
	visible,
	art,
	ethPrice,
	args,
	onClose,
	onUpdate
}) => {
	const balance = args?.quantity || 0;
	const price = args?.price || 0;

	const [status, setStatus] = React.useState<CheckoutSellStatus>({
		loading: false,
		quantity: 1,
		tx: null,
		confirmations: 0,
		success: false,
		errmsg: '',
	})
	const wallet = useWallet(visible, art?.id);
	const max = Math.min(balance, wallet.balance)
	
	
	const onSubmit = async () => {
		let errmsg = '';
		if (wallet.connected) {
			if (status.quantity>max) {
				errmsg = 'The quantity is too much. <=' + max
			} else {
				setStatus({ ...status, loading: true })
				const res = await call('/api/artwork/' + art.id, { action: 'sell', pid:args.id, count:status.quantity, seller:wallet.address, sellPrice:price })
				if (res.status === 'ok') {
					const result = await wallet.sell(res.msg)
					if (result.success && result.tx) {
						const tx = result.tx
						await call('/api/artwork/' + art.id, { action: 'tx', tx })
						setStatus({ ...status, loading: true, tx })
						const success = await wallet.waitTransaction( tx.txid, AtLeast, (confirmations: number) => { setStatus({ ...status, errmsg: '', loading: true, tx, confirmations, }) } )
						setStatus({ ...status, errmsg: success ? '' : 'Time out', tx, success: !!success, loading: true })
						let res = await call('/api/artwork/' + art.id, { action: 'check' }) as ApiResponse
						if (res.status==='ok') {
							res = await call('/api/artwork/' + art.id, { action: 'offers' }) as ApiResponse
							if (res.status==='ok') {
								onUpdate(res.msg)
							}
						}
					} else { 
						errmsg = result.errmsg || '';
					}
				} else {
					errmsg = 'An unexpected error occurred while getting data from the server.'
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
			title="Checkout to sell"
			onOk={onSubmit}
			onCancel={onCancel}
			footer={[
				<Button key="connect" type="primary" loading={wallet.connecting} onClick={wallet.connect} style={{ fontSize: 'large', padding: '10px 30px', height: 'auto', display: wallet.connected ? 'none' : '' }}>
					Connect Wallet
				</Button>,
				<Button key="submit" disabled={max<status.quantity || status.quantity<=0} type="primary" loading={status.loading || wallet.checkingBalance} onClick={onSubmit} style={{ fontSize: 'large', padding: '10px 30px', height: 'auto', display: !wallet.connected ? 'none' : '' }}>
					SUBMIT
				</Button>,
				<Button key="back" onClick={onCancel} style={{ fontSize: 'large', padding: '10px 30px', height: 'auto' }} >
					CANCEL
				</Button>
			]}
		>
			<h2><b>Item</b></h2>
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
                        <Input type="number" value={status.quantity} min={1} max={max} step={1} onChange={(e)=>setStatus({...status, quantity:Math.min(max,Number(e.target.value))})}  />
                    </div>
                    <b>Price</b>
					<h3>
						{Number(price.toFixed(6))} ETH (${' '}
						{(price * ethPrice).toFixed(2)})
					</h3>
                    <b>Amount</b>
                    <h3>{Number((price * status.quantity).toFixed(6))} ETH</h3>
				</div>
			</div>

			<hr />
			<h2><b>Your Collectibles: </b> { wallet.connected ? (
					wallet.checkingBalance ? (
						<span style={{color:'#888'}}>checking balance...</span>
					) : (
						<span style={{color:wallet.balance<status.quantity?'red':''}}>{wallet.balance + (wallet.balance<status.quantity?' (Insufficient tokens in wallet)':'')}</span>
					)
				) : (
					<span style={{color:'#888'}}>not connected wallet.</span>
				)}
			</h2>
			<h2>Proposer's volume : {balance}</h2>
			
			<h2 style={{ color: 'red' }}>{wallet.err || status.errmsg}</h2>
			{status.tx ? (
				<h2 style={{ textAlign: 'center' }}>
					tx: 
					<a
						href={explorer('tx', status.tx.txid)}
						target="_blank"
						style={{ marginRight: 20 }}
					>
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

export default CheckoutSell
