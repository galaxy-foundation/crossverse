import React from 'react'
import { getSession } from 'next-auth/client'
import { Row, Col, Table, Tooltip, Button } from 'antd'
import classNames from 'classnames'
/* import map from 'lodash/map'
import ArtworkCard from '@/components/Artwork/Card' */
import CarouselArtwork from '@/components/Carousel/Artwork'
import Page from '@/components/Page'
import PageTitle from '@/components/Page/Title'
import More from '@/components/More'
import { ROW_TWO_ITEMS_XL } from '@/config'
import { offsetDate } from '@/utils/helper'
import styles from './index.module.scss'
import { getPurchased, getOffersByUID, getTxs, getOffersWons } from '@/utils/datamodel'

const PAGE_NAME = 'My Profile'

interface ProfilePageProps {
	isDesktop:boolean
	isMobile:boolean
	my:Array<Artwork>
	offers:Array<OfferWithArt>
	wons:Array<OfferWithArt>
	txs:Array<Transaction>
}

interface ProfilePageStatus {
	loading:{[id:number]:boolean}
}


const ProfilePage = ({isDesktop, isMobile, my, offers, wons, txs}: ProfilePageProps):JSX.Element => {
	const [status] = React.useState<ProfilePageStatus>({
		loading:{}
	})

	const columns = [
        {
            title: 'From',
            key: 'from',
            dataIndex: 'from',
            render: (text: string) => (
                <Tooltip title={text}>
                    <div
                        className={classNames(
                            styles.clipAddress,
                            'text-truncate'
                        )}
                    >
                        {text}
                    </div>
                </Tooltip>
            ),
        },
        {
            title: 'To',
            key: 'to',
            dataIndex: 'to',
            render: (text: string) => (
                <Tooltip title={text}>
                    <div
                        className={classNames(
                            styles.clipAddress,
                            'text-truncate'
                        )}
                    >
                        {text}
                    </div>
                </Tooltip>
            ),
        },
        {
            title: 'Date',
            key: 'created',
            dataIndex: 'created',
            render: (created: number) => offsetDate(created, 0),
        },
        {
            title: 'Status',
            key: 'status',
            dataIndex: 'status',
            render: (status: number) => {
                let css = ''
                let text = ''
                if (status === 100) {
                    css = 'text-status-primary'
                    text = 'completed'
                } else if (status === 1) {
                    css = 'text-status-disabled'
                    text = 'cancelled'
                } else {
                    text = 'in progress'
                }
                return <span className={css}>{text}</span>
            },
        },
    ]
	const onCancelOffers = (artid:number) => {
		console.log(artid)
	}
	return (
		<Page className={styles.profile} title={PAGE_NAME}>
			<div className={styles.head}>
				<PageTitle className={classNames(styles.title, styles.paddingTitle)} fontWeight="Bold">
					{PAGE_NAME}
				</PageTitle>
			</div>
			<div className={styles.body}>
				<div className={styles.purchased}>
					<PageTitle className={classNames(styles.titleWithLink, styles.titlePadding)} fontWeight="Bold">
						<div>My Purchased NFTs</div>
						<More className={styles.titleExtra} href="/my/purchased">
							See all
						</More>
					</PageTitle>
					<CarouselArtwork className={styles.purchasedList} isMobile={isMobile} dataSource={my.map(v => ({ ...v }))} />
				</div>
				<div className={styles.order}>
					<PageTitle className={classNames(styles.titleWithLink, styles.titlePadding)} fontWeight="Bold">
						<div>My Orders</div>
						<More className={styles.titleExtra} href="/my/order">
							See all
						</More>
					</PageTitle>
					<Row className={styles.orderList} gutter={isDesktop ? 36 : 0}>
						<Col {...ROW_TWO_ITEMS_XL}>
							<h2>Won Auctions</h2><hr />
							{wons.length ? <table>
								<thead>
									<tr>
										<th></th>
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
									{wons.map((v) => (
										<tr key={v.tokenid}>
											<td>
												<Button onClick={()=>onCancelOffers(v.tokenid)} loading={!!status.loading[Number(v.tokenid)]}>
													Cancel Offer
												</Button>
											</td>
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
									<div>No offers yet</div>
								</div>
							)}
						</Col>
						<Col {...ROW_TWO_ITEMS_XL}>
							<h2>Bid History</h2><hr />
							{offers.length ? <table>
								<thead>
									<tr>
										<th></th>
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
									{offers.map((v) => (
										<tr key={v.tokenid}>
											<td>
												<Button onClick={()=>onCancelOffers(v.tokenid)} loading={!!status.loading[Number(v.tokenid)]}>
													Cancel Offer
												</Button>
											</td>
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
									)) }
								</tbody>
							</table>
							: (
								<div style={{ textAlign: 'center' }}>
									<img src="/images/empty-bids.svg" width={156} height={114} alt="empty offers" />
									<div>No offers yet</div>
								</div>
							)}
						</Col>
					</Row>
				</div>
				<div className={styles.transaction}>
					<PageTitle className={classNames(styles.titleWithLink, styles.titlePadding)} fontWeight="Bold">
						<div>Transaction History</div>
						{txs.length ? <More className={styles.titleExtra} href="/my/transaction">See all</More> : null}
						
					</PageTitle>
					{txs.length ? <Table scroll={isMobile ? { x: 1500 } : {}} bordered={false} columns={columns} dataSource={txs} pagination={false} rowKey="id" /> : (
						<div style={{ textAlign: 'center' }}>
							<img src="/images/empty-bids.svg" width={156} height={114} alt="empty offers" />
							<div>No transactions yet</div>
						</div>
					)}
				</div>
			</div>
		</Page>
	)
}

export async function getServerSideProps({ req }: any) {
	const session: any = await getSession({ req })
	let my:Array<Artwork> = [], offers:Array<OfferWithArt> = [], wons:Array<OfferWithArt> = [], txs:Array<Transaction> = [];
	if (session && session.user) {
		const { id } = session.user
		my = await getPurchased(id)
		offers = await getOffersByUID(id)
		wons = await getOffersWons(id)
		txs = await getTxs(id)

		return { props: { my, offers, wons, txs } }
	}
	return { props: { my, offers, wons, txs } }
}
export default ProfilePage
