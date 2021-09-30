import React from 'react'
import { getSession } from 'next-auth/client'
import { Row, Col } from 'antd'
import ArtworkStandard from '@/components/Artwork/Standard'
import Button from '@/components/Button'
import Page from '@/components/Page'
import PageTitle from '@/components/Page/Title'
import { ROW_THREE_ITEMS } from '@/config'
import styles from './index.module.scss'
import { getPurchased, getETHPrice } from '@/utils/datamodel'
import { call, getDomain } from '@/utils/helper'
import { getViewURL } from '@/utils/helper'
import TransferDialog from '@/components/Dialogs/TransferDialog'

import useWallet from '@/utils/useWallet'

import ShareBox from '@/components/Dialogs/ShareBox'


const PAGE_NAME = 'Purchased'

interface MyPurchasedProps {
	ethPrice: number
	data: Array<Artwork>
}

interface MyPurchasedStatus {
	transferdata: Artwork|null
	checked: boolean
	data: Array<Artwork>
	domain: string
    shareUrl:string

}

const MyPurchasedPage = ({ data, ethPrice }: MyPurchasedProps):JSX.Element => {
	const [status, setStatus] = React.useState<MyPurchasedStatus>({
		transferdata: null,
		checked: false,
		data,
		domain: '',
		shareUrl:''
	})
	const wallet = useWallet(false);
	const address = wallet.address.toLowerCase();

	React.useEffect(() => {
		const domain = getDomain()
		if (!status.checked) {
			setStatus({ ...status, domain, checked: true })
			call('/api/my/purchased', {}).then((res) => {
				if (res && res.status === 'ok') {
					setStatus({ ...status, checked: true, domain, data: res.msg })
				}
			})
		} else {
			setStatus({...status, domain})
		}
	}, [])
	const onShare = (url:string) => setStatus({...status, shareUrl:status.domain+url})
	return (
		<Page className={styles.purchased} title={PAGE_NAME}>
			<PageTitle className={styles.title} fontWeight="Bold">
				My Purchased NFTs
			</PageTitle>
			<div className={styles.cardList}>
				<Row gutter={64}>
					{status.data.map(v => (
						<Col {...ROW_THREE_ITEMS} key={v.id+'-'+v.ownerAddress}>
							<ArtworkStandard
								className={styles.card}
								artist={v.author}
								thumbnail={v.thumbnail}
								name={v.title}
								mode="market"
								priceALT={v.price}
								priceFIAT={v.price * ethPrice}
								balance={v.balance}
								address={v.ownerAddress}
								href={getViewURL(v.id)}
								footer={
									<>
										<Button disabled={address!==v.ownerAddress?.toLowerCase()} title={address!==v.ownerAddress?.toLowerCase()?"The current wallet is not the wallet where the tokens are stored.":''} onClick={()=>setStatus({...status, transferdata:v})} block wrapClassName={styles.btn}>
											Transfer
										</Button>
										<Button onClick={()=>onShare(getViewURL(v.id))} block wrapClassName={styles.btn} type="primary">
											Share
										</Button>
									</>
								}
							/>
						</Col>
					))}
				</Row>
			</div>
			{ status.transferdata!==null ? (
				<TransferDialog
					visible={true}
					onClose={() => setStatus({ ...status, transferdata:null })}
					art={status.transferdata}
				/>
			) : null }
			<ShareBox onClose={()=> setStatus({...status,shareUrl:''})} url={status.shareUrl} visible={status.shareUrl!==''}/>
		</Page>
	)
}

export async function getServerSideProps({ req }: any) {
	const session: any = await getSession({ req })
	const ethPrice = await getETHPrice()
	if (session && session.user) {
		const { id } = session.user
		const data = await getPurchased(id)
		return { props: { data, ethPrice } }
	}
	return { props: { data: [], ethPrice } }
}

export default MyPurchasedPage
