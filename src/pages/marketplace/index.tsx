import React, { useState } from 'react'
import { Row, Col, Select } from 'antd'

import ArtworkStandard from '@/components/Artwork/Standard'
import Button from '@/components/Button'
import Page from '@/components/Page'
import PageTitle from '@/components/Page/Title'
import { ROW_THREE_ITEMS, ROW_TWO_ITEMS_XL } from '@/config'
import { getPageName } from '@/utils/common'
import { getNftList, getETHPrice } from '@/utils/datamodel'

import Category from '@/config/category.json'
import OrderBy from '@/config/orderby.json'
import styles from './index.module.scss'
import { getDomain, getViewURL } from '@/utils/helper'
import Link from 'next/link'
import { getQueryVariable } from '@/utils/helper'
import ShareBox from '@/components/Dialogs/ShareBox'

const PAGE_NAME = 'Marketplace'

interface MarketPlacePageProp {
	isDesktop: boolean
	data: Array<Artwork>
	ethPrice: number
}
interface MarketPlaceStatus {
	category: number
	orderBy: number
    query:string
	domain: string
    shareUrl:string
}

const MarketPlacePage = ({ isDesktop, data, ethPrice }: MarketPlacePageProp):JSX.Element => {
	const [status, setStatus] = useState<MarketPlaceStatus>({
		category: 0,
		orderBy: 10,
		query: '',
		domain: '',
		shareUrl:''
	})
	const dataSource:Array<Artwork> = [];
	for(let v of data) {
		if (status.query && v.title.indexOf(status.query)===-1) continue;
		if (status.category===0 || v.category===status.category) {
			dataSource.push(v);
		}
	}
	
    React.useEffect(()=>{
		const domain = getDomain()
        const query = getQueryVariable('q');
        if (query) {
            setStatus({...status, query, domain})
        } else {
			setStatus({...status, domain})
		}
    }, [])

	dataSource.sort((a,b)=>{
		switch(status.orderBy) {
		case 10: // Recently Listed
			return b.created - a.created;
		case 20: // Recently sold
			return 0
		case 30: // Price: Low to high
			return a.price - b.price
		case 40: // Price: High to low
			return b.price - a.price
		case 50: // Most viewed
			return b.views - a.views
		case 60: // Most favorited
			return b.likes - a.likes
		}
		return 0;
	})

	const onCategory = (category: number) => setStatus({...status, category})
	const onOrderBy = (orderBy: number) => setStatus({...status, orderBy})
	const onShare = (url:string) => setStatus({...status, shareUrl:status.domain+url})
	return (
		<Page className={styles.market} title={getPageName(PAGE_NAME)}>
			<div className={styles.head}>
				<PageTitle className={styles.title} fontWeight="Bold">
					{PAGE_NAME}
				</PageTitle>
				<Row className={styles.filter} gutter={isDesktop ? 36 : 0}>
					<Col {...ROW_TWO_ITEMS_XL}>
						<Select className={styles.select} options={Category} value={status.category} onChange={(value: number) => onCategory(value)}/>
					</Col>
					<Col {...ROW_TWO_ITEMS_XL}>
						<Select className={styles.select} options={OrderBy} value={status.orderBy} onChange={(value: number) => onOrderBy(value)}/>
					</Col>
				</Row>
			</div>
			<div className={styles.body}>
				<Row gutter={isDesktop ? 32 : 0}>
					{dataSource.map((item) => (
						<Col {...ROW_THREE_ITEMS} key={item.id}>
							<ArtworkStandard
								className={styles.card}
								artist={item.author}
								thumbnail={item.thumbnail}
								name={item.title}
								mode="market"
								priceALT={item.price}
								priceFIAT={item.price * ethPrice}
								footer={
									<>
										<Link href={getViewURL(item.id)}>
											<Button block wrapClassName={styles.btn} type="primary">
												Collect
											</Button>
										</Link>
										<Button onClick={()=>onShare(getViewURL(item.id))} block wrapClassName={styles.btn} type="primary">
											Share
										</Button>
									</>
								}
							/>
						</Col>
					))}
				</Row>
			</div>
			<ShareBox onClose={()=> setStatus({...status,shareUrl:''})} url={status.shareUrl} visible={status.shareUrl!==''}/>
		</Page>
	)
}
export async function getServerSideProps() {
	const data = await getNftList()
	const ethPrice = await getETHPrice()
	return {props: { data, ethPrice }}
}
export default MarketPlacePage
