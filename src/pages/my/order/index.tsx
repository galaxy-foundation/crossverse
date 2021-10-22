import React from 'react'
import { getSession } from 'next-auth/client'
/* import { Row, Col } from 'antd' */
import classNames from 'classnames'
/* import ArtworkCard from '@/components/Artwork/Card' */
import Page from '@/components/Page'
import PageTitle from '@/components/Page/Title'
/* import { ROW_TWO_ITEMS } from '@/config' */
import { /* getViewURL,  */offsetDate } from '@/utils/helper'
import styles from './index.module.scss'
import { getOffersByUID } from '@/utils/datamodel'
import { call } from '@/utils/helper'

const PAGE_TITLE = 'My Orders'

interface MyOrderProps {
	wons: Array<OfferWithArt>
	bids: Array<OfferWithArt>
}

interface MyOrderStatus {
	checked: boolean
	wons: Array<OfferWithArt>
	bids: Array<OfferWithArt>
}

const MyOrderPage = ({wons, bids}: MyOrderProps):JSX.Element => {
	const [status, setStatus] = React.useState<MyOrderStatus>({
		checked: false,
		wons, 
		bids,
	})
	

	React.useEffect(() => {
		if (!status.checked) {
			call('/api/my/order', {}).then((res) => {
				if (res && res.status === 'ok') {
					setStatus({ ...status, checked: true, ...res.msg })
				}
			})
		}
	}, [])

	/* const renderStatus = () => {
		return <div>Complete</div>
	} */

	return (
		<Page className={styles.order} title={PAGE_TITLE}>
			<PageTitle className={styles.title} fontWeight="Bold">
				{PAGE_TITLE}
			</PageTitle>
			<div className={classNames(styles.cardWon, styles.cardPadding)}>
				<PageTitle className={styles.subTitle} fontWeight="Medium">
					Won Auctions
				</PageTitle>
				{status.wons.length ? <table>
					<thead>
						<tr>
							<th style={{ textAlign: 'left' }}>
								From
							</th>
							<th style={{ textAlign: 'right' }}>
								Price
							</th>
							<th style={{ textAlign: 'right' }}>
								Quantity
							</th>
							<th style={{ textAlign: 'right' }}>
								Amount
							</th>
							<th style={{ textAlign: 'center' }}>
								Created
							</th>
						</tr>
					</thead>
					<tbody>
						{status.wons.map((v) => (
							<tr key={v.tokenid}>
								<td style={{ textAlign: 'left' }}>
									{v.from || '-'}
								</td>
								<td style={{ textAlign: 'right' }}>
									{Number(v.price.toFixed(6))} WETH
								</td>
								<td style={{ textAlign: 'right' }}>
									{v.quantity}
								</td>
								<td style={{ textAlign: 'right' }}>
									{Number( v.amount.toFixed(6) )} WETH
								</td>
								<td style={{ textAlign: 'center' }}>
									{offsetDate(v.created, 0)}
								</td>
							</tr>
						))}
					</tbody>
				</table> : (
					<div style={{ textAlign: 'center' }}>
						<img src="/images/empty-bids.svg" width={156} height={114} alt="empty offers" />
						<div>No wons</div>
					</div>
				)}
			</div>
			<hr style={{marginBottom:50}} />
			<div className={classNames(styles.cardBid, styles.cardPadding)}>
				<PageTitle className={styles.subTitle} fontWeight="Medium">
					Bid History
				</PageTitle>
				{status.bids.length ? <table style={{width:'100%'}} cellPadding={5}>
					<thead>
						<tr>
							<th style={{ textAlign: 'left' }}>
								From
							</th>
							<th style={{ textAlign: 'right' }}>
								Price
							</th>
							<th style={{ textAlign: 'right' }}>
								Quantity
							</th>
							<th style={{ textAlign: 'right' }}>
								Amount
							</th>
							<th style={{ textAlign: 'center' }}>
								Created
							</th>
						</tr>
					</thead>
					<tbody>
						{status.bids.map((v) => (
							<tr key={v.tokenid}>
								<td style={{ textAlign: 'left' }}>
									{v.from || '-'}
								</td>
								<td style={{ textAlign: 'right' }}>
									{Number(v.price.toFixed(6))} WETH
								</td>
								<td style={{ textAlign: 'right' }}>
									{v.quantity}
								</td>
								<td style={{ textAlign: 'right' }}>
									{Number( v.amount.toFixed(6) )} WETH
								</td>
								<td style={{ textAlign: 'center' }}>
									{offsetDate(v.created, 0)}
								</td>
							</tr>
						))}
					</tbody>
				</table> : (
					<div style={{ textAlign: 'center' }}>
						<img src="/images/empty-bids.svg" width={156} height={114} alt="empty offers" />
						<div>No bids</div>
					</div>
				)}
			</div>
		</Page>
	)
}

export async function getServerSideProps({req}:any) {
	const session: any = await getSession({ req })
	/* const ethPrice = await getETHPrice() */
	if (session && session.user) {
		const { id } = session.user
		const rows = await getOffersByUID(id)
		const wons:Array<OfferWithArt> = [];
		const bids:Array<OfferWithArt> = [];
		for(let v of rows) {
			if (v.status===100) {
				wons.push(v)
			} else {
				bids.push(v)
			}
		}
		return { props: { wons, bids/* , ethPrice */ } }
	}
	return { props: { wons: [], bids: []/* , ethPrice */ } }
}
export default MyOrderPage
