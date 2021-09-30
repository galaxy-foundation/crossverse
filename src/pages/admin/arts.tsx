import React from 'react'
import { getSession } from 'next-auth/client'
import { Spin, Switch } from 'antd'
import Page from '@/components/Page'
import styles from './index.module.scss'
import { call, getViewURL } from '@/utils/helper'
import { getETHPrice, admin_get_arts, getCampaign } from '@/utils/datamodel'
import DialogArt, {DialogArtProps} from './components/DialogArt'

interface AdminProps {
	arts: AdminArts 
	campaign: Campaigns
	ethPrice: number
}
interface AdminStatus {
	loading: boolean
	arts: AdminArts
	args?: DialogArtProps
}

const PAGE_NAME = 'NFT Manager'

const AdminPage = ( { arts, ethPrice, campaign }: AdminProps):JSX.Element => {
	const [status, setStatus] = React.useState<AdminStatus>({
		loading: false,
		arts
	})
	const onChangeArts = async (id:number, field:string, value:string|number) => {
		setStatus({ ...status, loading: true })
		const reuslt = await call('/api/admin/arts', {act:'update', msg: {id,field,value}});
		if (reuslt && reuslt.status === 'ok') {
			setStatus({...status, loading: false, arts:{...status.arts, [id]:{...status.arts[id],[field]:value}}});
		} else {
			setStatus({ ...status, loading: false })
		}
	}
	const showDialogArt = (id:number) => {
		const d = status.arts[id];
		setStatus({ ...status, args:{id, d, campaign}})
	}
	const onUpdate = (id:number, data:AdminArt) => {
		const newStatus = {...status, arts: {...status.arts, [id]:data}}
		delete newStatus.args
		setStatus(newStatus)
	}
	const onClose = () => {
		const newStatus = {...status}
		delete newStatus.args
		setStatus(newStatus)
	}
	return (
		<Page className={styles.admin} title={PAGE_NAME}>
			<h1 style={{textAlign:'center'}}>
				<b>NFT Manager： ETH Price {ethPrice}</b> 
				<a className={styles.cmd} href="/admin/create" style={{float:'right'}}>Create</a>
			</h1>
			<Spin tip="updating..." size="large" spinning={status.loading}>
			<table>
				<thead>
					<tr>
						<th style={{textAlign:'center'}}>TokenID</th>
						<th style={{textAlign:'left'}}>Artist</th>
						<th style={{textAlign:'left'}}>Title</th>
						<th style={{textAlign:'right'}}>Price</th>
						<th style={{textAlign:'center'}}>TotalSupply</th>
						<th style={{textAlign:'center'}}>In Stock</th>
						<th style={{textAlign:'center'}}>Circulating</th>
						<th style={{textAlign:'center'}}>Auction</th>
						<th style={{textAlign:'center'}}>Drop</th>
						<th style={{textAlign:'center'}}>Recommended</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{Object.keys(status.arts).map(k=>{
						const id = Number(k);
						const v = status.arts[id];
						return (<tr key={id}>
							<td style={{textAlign:'center'}}><a href={getViewURL(id)} target="_blank">{id}</a></td>
							<td>@{v.author} <small style={{padding:'2px 5px', fontSize:10, backgroundColor:'#666', color:'white', borderRadius:5}}>{v.worknumber}</small></td>
							<td>{v.name}</td>
							<td style={{textAlign:'right'}}>{v.price} ETH</td>
							<td style={{textAlign:'center'}}>{v.totalsupply}</td>
							<td style={{textAlign:'center'}}>{v.instock}</td>
							<td style={{textAlign:'center'}}>{v.totalsupply-v.instock}</td>
							<td style={{textAlign:'center'}}>
								{(v.auction && v.drop) ? 'Yes' : ''}
							</td>
							<td style={{textAlign:'center'}}>
								<Switch checked={v.drop===1} onChange={checked=>onChangeArts(id, 'drop', checked?1:0)} />
							</td>
							<td style={{textAlign:'center'}}>
								<Switch checked={v.pinned===1} onChange={checked=>onChangeArts(id, 'pinned', checked?1:0)} />
							</td>
							<td style={{textAlign:'center'}}>
								<button onClick={()=>showDialogArt(id)}>Edit</button>
							</td>
						</tr>)
					})}
				</tbody>
			</table>
			</Spin>
			{status.args!==undefined ? <DialogArt {...status.args} onClose={onClose} onUpdate={onUpdate}  /> : null}
		</Page>
	)
}
export async function getServerSideProps({req}:any) {
	const session: any = await getSession({ req })
	const ethPrice = await getETHPrice()
	const campaign = await getCampaign()
	let arts:AdminArts = {};
	if (session && session.user) {
		const { id } = session.user
		if (id<100010) {
			arts = await admin_get_arts();
		}
	}
	return { props: { arts, campaign, ethPrice } }
}
export default AdminPage
