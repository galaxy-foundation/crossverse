import React from 'react'
import { Button, Modal, Input } from 'antd'
import { call } from '@/utils/helper'
import useWallet, { explorer, confirmations as AtLeast } from '@/utils/useWallet'

interface CheckoutBuyProps {
	onClose: () => void
	art: Artwork
	args:{id:number|string,price:number,quantity:number}
	visible: boolean
	ethPrice: number
}

interface CheckoutBuyStatus {
	loading: boolean
	token: string
	quantity: number
	amount: number
	tx: Transaction | null
	txDesc: string
	confirmations: number
	success: boolean
}

const CheckoutBuy: React.FC<CheckoutBuyProps> = ({ visible, art, args, ethPrice, onClose }) => {
	const [status, setStatus] = React.useState<CheckoutBuyStatus>({
		loading:false,
		token:'ETH',
		quantity: 1,
		amount: args?.price || 0,
		tx: null,
		txDesc: '',
		confirmations: 0,
		success: false,
	})
	const wallet = useWallet(visible);
	const balance = status.token==='ETH' ? wallet.ETH : wallet.WETH
	const [error, setError] = React.useState('');
	const price = args?.price || 0;
	const max = args?.quantity || 0
	const tokens = ['ETH', 'WETH'];
	
	const onSubmit = async () => {
		let err = '';
		if (wallet.connected) {
			if (status.quantity>args.quantity) {
				err = '❌ The quantity is too much. <=' + args.quantity
			} else {
				console.log('price:', price, price * status.quantity)
				setError(err)
				setStatus({ ...status, loading: true })
				const res = await call('/api/artwork/' + art.id, { action: 'buy', pid:args.id, count:status.quantity, buyer:wallet.address, buyPrice:price })
				if (res.status === 'ok') {
					let result = null;
					const amount = price * status.quantity;
					if (status.token==='ETH') {
						result = await wallet.buy(res.msg, res.msg[4])
					} else {
						const approval = await wallet.approval(); 
						if (approval<amount) {
							result = await wallet.approve(amount);
							if (result.success && result.tx) {
								const tx = result.tx
								const success = await wallet.waitTransaction( tx.txid, AtLeast, (confirmations: number) => { setStatus({ ...status, loading: true, tx, txDesc:'Approve', confirmations }) } )
								if (!success) {
									setError(success ? '' : '❌ transaction time out');
									return setStatus({ ...status, loading: false, tx: null})
								}
							} else {
								setError('❌ transaction failed');
								return setStatus({ ...status, loading: false, tx: null})
							}
						}
						result = await wallet.buy(res.msg, 0)
					}
					if (result.success && result.tx) {
						const tx = result.tx
						await call('/api/artwork/' + art.id, { action: 'tx', tx })
						setStatus({ ...status, loading: true, tx })
						const success = await wallet.waitTransaction( tx.txid, AtLeast, (confirmations: number) => { setStatus({ ...status, loading: true, tx, txDesc:'Buying', confirmations }) } )
						setError(success ? '' : '❌ transaction time out')
						await call('/api/artwork/' + art.id, { action: 'check' })
						return window.open('/my/purchased', '_self')
					} else {
						err = result.errmsg || ''
					}
				} else {
					err = 'An unexpected error occurred while getting data from the server.'
				}
				setStatus({ ...status, loading: false, tx: null})
			}
		} else {
			err = '🦊 Connect to Metamask'
		}
		if (err) setError(err)
	}
	const onCancel = () => {
		onClose()
	}
	return (
		<Modal
			visible={visible}
			title="Checkout to Buy"
			onOk={onSubmit}
			onCancel={onCancel}
			footer={[
				<Button key="connect" type="primary" loading={wallet.connecting} onClick={wallet.connect} style={{ fontSize: 'large', padding: '10px 30px', height: 'auto', display: wallet.connected ? 'none' : '' }}>
					Connect Wallet
				</Button>,
				<Button key="submit" disabled={wallet.checkingBalance || balance < price} type="primary" loading={wallet.checkingBalance || status.loading} onClick={onSubmit} style={{ fontSize: 'large', padding: '10px 30px', height: 'auto', display: !wallet.connected ? 'none' : '' }}>
					BUY NOW
				</Button>,
				<Button key="back" onClick={onCancel} style={{ fontSize: 'large', padding: '10px 30px', height: 'auto' }} >
					Cancel
				</Button>
			]}
		>
			<h2><b>Item</b></h2>
			<hr />
			<div>
				<h2>{art?.title}</h2>
			</div>
			<div style={{ display: 'flex' }}>
				<div style={{ width: 100, height: 100, display:'flex', justifyContent:'center', border: '1px solid #eee', borderRadius:5, padding: 2 }}>
					<img alt="thumbnail" src={art?.thumbnail || ''} style={{ maxWidth: '100%', maxHeight: '100%' }}/>
				</div>
				<div style={{ flexGrow: 1, paddingLeft: 20 }}>
					<b>Quantity</b>
                    <div>
                        <Input type="number" value={status.quantity} min={1} max={max} step={1} onChange={(e)=>setStatus({...status, quantity:Math.min(max, Number(e.target.value))})}  />
                    </div>
                    <b>Price</b>
					<div style={{display:'flex'}}>
						<Input value={Number(price.toFixed(6))} style={{ width:100, textAlign:'right' }} readOnly />
						<select style={{border: '1px solid #d9d9d9', outline:'none', marginLeft:-1}} value={status.token} onChange={e=>setStatus({...status, token:e.target.value})}>
							{tokens.map(v=><option key={v} value={v}>{v}</option>)}
						</select>
						<div style={{display:'flex',alignItems:'center', paddingLeft:20, color: '#888'}}>
							$ {(price * ethPrice).toFixed(2)}
						</div>
					</div>
					
                    <b>Amount</b>
                    <h3>{Number((price*status.quantity).toFixed(6))} {status.token}</h3>
				</div>
			</div>

			<hr />
			<h2><b>Your balance: </b> { wallet.connected ? (
					wallet.checkingBalance ? (
						<span style={{color:'#888'}}>checking balance...</span>
					) : (
						<span style={{color:balance<price?'red':''}}>{Number(balance.toFixed(6)) + ' ' + status.token + (balance<price?' (Insufficient balance)':'')}</span>
					)
				) : (
					<span style={{color:'#888'}}>not connected wallet.</span>
				)}
			</h2>
			<h2 style={{ color: 'red' }}>{wallet.err || error}</h2>
			{status.tx ? (
				<h2 style={{ textAlign: 'center' }}>
					{status.txDesc}: <a href={explorer('tx', status.tx.txid)} target="_blank" style={{ marginRight: 20 }} >
						{status.tx.txid.slice(0, 6) + '...' + status.tx.txid.slice(-4)}
					</a>
					{status.success ? ( <span style={{ color: 'green' }}>Success</span> ) : null}
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

export default CheckoutBuy
