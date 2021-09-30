import React from 'react'
import { Modal, Form, Upload, Button, Input, Checkbox } from 'antd'
import { UploadOutlined } from '@ant-design/icons'

import Category from '@/config/category.json'
import { call, getLocalTime} from '@/utils/helper'
import styles from './DialogArt.module.scss'

export interface DialogArtProps {
	onClose?: () => void
	onUpdate?: (id:number, data:AdminArt) => void
	campaign: Campaigns
	id: number,
	d: AdminArt
}

interface DialogArtStatus {
	loading: boolean
	supplyvisible: boolean
	supplyloading: boolean
	autothumbnail: boolean
	quantity: number
	fileList: Array<any>
	thumbnail: Array<any>
	errmsg: string
}

const DialogArt: React.FC<DialogArtProps> = ({id, d, campaign, onClose, onUpdate}) => {
	const [status, setStatus] = React.useState<DialogArtStatus>({
		loading: false,
		supplyvisible: false,
		supplyloading: false,
		quantity: 0,
		autothumbnail: true,
		fileList: [],
		thumbnail: [],
		errmsg: ''
	})
	const [data, setData] = React.useState<AdminArt>({
		key: d?.key || '',
		store: d?.store || '',
		uid: d?.uid || 0,
		author: d?.author || '',
		worknumber: d?.worknumber || 0,
		category: d?.category || 0,
		name: d?.name || '',
		description: d?.description || '',
		physical: !!d?.physical,
		price: d?.price || 0,
		auction: !!d?.auction,
		auctiontime: campaign?.lasttime || 0, //d?.auctiontime || 0,
		totalsupply: d?.totalsupply || 0,
		instock: d?.instock || 0,
		volume: d?.volume || 0,
		drop: d?.drop || 0,
		pinned: d?.pinned || 0,
		created: d?.created || 0,
	})
	const [form] = Form.useForm()
	const refStore = React.useRef<Input>(null)
	const refAuthor = React.useRef<Input>(null)
	const refWorknumber = React.useRef<Input>(null)
	const refCategory = React.useRef<HTMLSelectElement>(null)
	const refName = React.useRef<Input>(null)
	const refDescription = React.useRef<HTMLTextAreaElement>(null)
	const refPrice = React.useRef<Input>(null)

	const update = (field:string, value:string|number|boolean) => {
		setData({...data, [field]:value})
	}
	const onFileChange = async (res: any) => {
		const {fileList} = res;
		setStatus({ ...status, fileList })
	}
	const onThumbnailChange = async (res: any) => {
		const { fileList } = res
		setStatus({ ...status, thumbnail:fileList })
	}
	const onSubmit = async () => {
		const store = data.store.trim()
		const author = data.author.trim()
		const worknumber = data.worknumber
		const category = data.category
		const name = data.name.trim()
		const description = data.description.trim()
		const price = data.price
		const auction = data.auction
		const auctiontime = data.auctiontime
		const physical = data.physical
		const file: any = status.fileList.length > 0 ? status.fileList[0] : null
		const thumbnail: any = status.thumbnail.length > 0 ? status.thumbnail[0] : null
		if (store === '') return refStore.current?.focus()
		if (category === 0) return refCategory.current?.focus()
		if (name === '') return refName.current?.focus()
		if (description === '') return refDescription.current?.focus()
		if (price === 0) return refPrice.current?.focus()

		setStatus({ ...status, loading: true })
		const result = await call('/api/admin/create', {
			tokenid:id,
			store,
			author,
			worknumber,
			category,
			name,
			description,
			priceEth: price,
			auction: auction,
			auctiontime,
			physical,
			file: file && file.response || null,
			thumbnail: thumbnail && thumbnail.response || null
		})
		if (result) {
		 	if (result.status === 'ok') {
				 if (auction) {
					 data.instock = 1;
					 data.totalsupply = 1;
				 }
				if (onUpdate) onUpdate(id, data)
			} else {
				setStatus( { ...status, errmsg: result.msg } )
			}
		} else {
			setStatus( { ...status, errmsg: 'network issue' } )
		}
	}
	const onCancel = () => {
		if (onClose) onClose()
	}
	const onSupplyCancel = () => {
		setStatus({...status, supplyvisible:false})
	}
	const onSupplySubmit = async () => {
		setStatus({...status, supplyloading:true})
		const result = await call('/api/admin/supply', { tokenid:id, quantity: status.quantity })
		if (result) {
		 	if (result.status === 'ok') {
				 data.totalsupply += status.quantity
				 data.instock += status.quantity
				 
				if (onUpdate) onUpdate(id, data)
				setStatus( { ...status, quantity:0 } )
			} else {
				setStatus( { ...status, errmsg: result.msg } )
			}
		} else {
			setStatus( { ...status, errmsg: 'network issue' } )
		}
	}

	return (
		<Modal
			className={styles.dialog}
			visible={true}
			title={`Update [${d?.name || ''}]`}
			onOk={onSubmit}
			onCancel={onCancel}
			footer={[
				<Button key="submit" type="primary" loading={status.loading} onClick={onSubmit} style={{ padding: '10px 30px', height: 'auto' }}>
					UPDATE
				</Button>,
				<Button key="back" onClick={onCancel} style={{ padding: '10px 30px', height: 'auto' }} >
					CANCEL
				</Button>,
			]}
		>
			<Form form={form} style={{ flex: '1 1 auto' }} onFinish={onSubmit} >
				<b>Token ID</b>
				<Form.Item className={styles.item}>
					<Input disabled={true} value={id} />
				</Form.Item>
				<b>Store</b>
				<Form.Item className={styles.item}>
					<Input placeholder="Store" value={data.store} onChange={ (e) =>update('store', e.target.value) } />
				</Form.Item>
				<b>Author</b>
				<Form.Item className={styles.item} rules={[{required: true,message: 'Author required'}]}>
					<Input ref={ refAuthor } placeholder="Author" value={ data.author } onChange={ (e) =>update('author', e.target.value) }/>
				</Form.Item>
				<b>Work Number</b>
				<Form.Item className={styles.item} rules={[{required: true, message: 'Work Number required'}]}>
					<Input ref={refWorknumber} placeholder="Work Number" type="number" min={0} max={10000} step="1" value={data.worknumber} onChange={(e) =>update('worknumber', Number(e.target.value))}/>
				</Form.Item>
				<b>Category</b>
				<Form.Item className={styles.item} rules={[{required: true, message: 'Category required'}]}>
					<select ref={refCategory} value={ data.category } onChange={ (e) =>update('category', Number(e.target.value)) }>
						<option value="0">- Select category -</option>
						{Category.map((v) => (
							<option key={v.value} value={v.value}>
								{v.label}
							</option>
						))}
					</select>
				</Form.Item>
				<b>Name</b>
				<Form.Item className={styles.item} rules={[{required: true, message: 'Name required'}]}>
					<Input ref={refName} placeholder="Name" value={data.name} onChange={(e) =>update('name', e.target.value)}/>
				</Form.Item>
				<b>Description</b>
				<Form.Item className={styles.item} rules={[{required: true, message: 'Description required'}]}>
					<Input.TextArea ref={refDescription} placeholder="Description" value={ data.description } onChange={ (e) =>update('description', e.target.value) }/>
				</Form.Item>
				<b>Supportted Format: JPG, PNG, GIF, MP3, MP4: Less than 20MB</b>
				<Form.Item className={styles.item} rules={[{required: true, message: 'File required'}]}>
					<Upload action="/api/admin/upload" maxCount={1} fileList={ status.fileList } onChange={onFileChange}>
						<Button icon={<UploadOutlined />}>Upload File</Button>
					</Upload>
				</Form.Item>
				<b>Thumbnail (supportted Format: JPG, PNG: Less than 1MB)</b>
				<Form.Item className={styles.formItem} rules={[{required: true, message: 'File required'}]}>
					<Upload listType="picture" action="/api/admin/upload" maxCount={1} fileList={status.thumbnail} onChange={onThumbnailChange} >
						<Button icon={<UploadOutlined />}>Upload thumbnail</Button>
					</Upload>
				</Form.Item>
				<div style={{marginBottom:20}}>
					<Checkbox checked={data.auction} onChange={(e) =>update('auction', e.target.checked)}>
						Highest Bid (Auction to the highest bidder)
					</Checkbox>
				</div>
				<b>Price (ETH)</b>
				<div style={{ display: 'flex' }}>
					<Form.Item className={styles.item} style={{ width: 150 }} rules={[ { required: true, message: 'Price required' }]} >
						<Input ref={refPrice} placeholder="Price" type="number" min="0.001" max="1000" step="0.0001" value={ data.price } onChange={ (e) =>update('price', Number(e.target.value)) } />
					</Form.Item>
				</div>
				{data.auction ? (
					<div style={{marginBottom:20}}>
						<b>Expiration Date: {getLocalTime(data.auctiontime)}</b>
					</div>
				) : null}
				{/* {data.auction ? (
					<>
						<b>Expiration Date</b>
						<Form.Item className={styles.formItem} rules={[ { required: true, message: 'Last Time required' } ]} >
							<Input
								type="datetime-local"
								placeholder="Last Time"
								value={data.auctiontime}
								min={new Date((now() + 86400 * 1) *1000).toISOString().slice(0,16)}
								max={new Date((now() + 86400 * 31) *1000).toISOString().slice(0,16)}
								onChange={(e) =>
									update('auctiontime', e.target.value)
								}
							/>
						</Form.Item>
						<div style={{marginBottom:20}}>Your auction will automatically end at this time and the highest bidder will win. No need to cancel it!</div>
					</>
				) : null} */}
				
				<Form.Item className={styles.item}>
					<Checkbox checked={ data.physical } onChange={ (e) =>update('physical', e.target.checked) } >
						Physical
					</Checkbox>
				</Form.Item>
				<div style={{ color: 'red' }}>{status.errmsg}</div>
			</Form>
			
			<div>
				totalsupply <b style={{marginRight:20}}>{data.totalsupply}</b>
				instock <b style={{marginRight:20}}>{data.instock}</b>
				circlulating <b style={{marginRight:20}}>{data.totalsupply - data.instock}</b>
			</div>
			{data.auction ? null : (
				<div>
					<button onClick={()=>setStatus({...status, supplyvisible:true})}>
						Add Supply
					</button>
				</div>
			)}
			
			<Modal
				visible={status.supplyvisible}
				title="Add Supply"
				onOk={onSupplySubmit}
				onCancel={onSupplyCancel}
				footer={[
					<Button key="submit" type="primary" loading={status.supplyloading} onClick={onSupplySubmit}>
						UPDATE
					</Button>,
					<Button key="back" onClick={onSupplyCancel}>
						CANCEL
					</Button>
				]}
			>
				<input value={status.quantity} onChange={e=>setStatus({...status, quantity:Number(e.target.value)})} />
				<div>
					totalsupply <b style={{marginRight:20}}>{status.quantity + data.totalsupply}</b>
					instock <b style={{marginRight:20}}>{status.quantity + data.instock}</b>
					circlulating <b style={{marginRight:20}}>{data.totalsupply - data.instock}</b>
				</div>
			</Modal>
		</Modal>
	)
}

export default DialogArt
