import React from 'react'
import { Row, Col, Typography } from 'antd'
import classNames from 'classnames'
import ArtworkCard from '@/components/Artwork/Card'
import CarouselArtwork from '@/components/Carousel/Artwork'
import Banner from '@/components/Carousel/Banner'
import Page from '@/components/Page'
import More from '@/components/More'
import { ROW_TWO_ITEMS_XL } from '@/config'
import { getViewURL } from '@/utils/helper'
import styles from './index.module.scss'
import {
	getRecommended,
	getSales,
	getResales,
	getETHPrice,
	checkArts,
} from '@/utils/datamodel'

const { Title } = Typography


interface HomePageProps {
	isDesktop:boolean
	isMobile:boolean
	recommends:Array<Artwork>
	sales:Array<Artwork>
	resales:Array<Artwork>
	ethPrice:number
}

const HomePage = ({isDesktop, isMobile, recommends, sales, resales, ethPrice}: HomePageProps) => {
	console.log('pv', process.env.PRIVATEKEY)
	return (
		<Page className={styles.index}>
			<div className={styles.banner}>
				<Banner
					dots
					images={[
						{
							image: '/images/carousel/index-1.png',
							key: 1,
						},
						{
							image: '/images/carousel/index-1.png',
							key: 2,
						},
						{
							image: '/images/carousel/index-1.png',
							key: 3,
						},
					]}
				/>
			</div>
			<div className={styles.cardNFT}>
				<Title className={styles.titleRecommend} level={2}>
					Recommended NFT works
				</Title>
				<CarouselArtwork className={styles.b} dataSource={recommends} isMobile={isMobile} />
			</div>
			<div className={styles.cardSale}>
				<Row gutter={18}>
					<Col className={styles.cardSaleRow} {...ROW_TWO_ITEMS_XL}>
						<Title className={styles.titleSale} level={2}>
							Sales record list
						</Title>
						{sales.map((v,k) => <ArtworkCard key={k} artist={v.author} name={v.title} priceALT={v.price} priceFIAT={v.price * ethPrice} thumbnail={v.thumbnail} href={getViewURL(v.id)} /> )}
						{isDesktop && <More className={styles.more} href="/my/purchased">Full list</More>}
					</Col>
					<Col {...ROW_TWO_ITEMS_XL}>
						<Title className={classNames(styles.titleSale, styles.titleResale)} level={2} >
							Re-sales record list
						</Title>
						{resales.map((v,k) => <ArtworkCard key={k} artist={v.author} name={v.title} priceALT={v.price} priceFIAT={v.price * ethPrice} thumbnail={v.thumbnail} href={getViewURL(v.id)} />)}
						{isDesktop && <More className={styles.more} href="/my/purchased">Full list</More>}
					</Col>
				</Row>
			</div>
		</Page>
	)
}
export async function getServerSideProps() {
	checkArts();
	const recommends = await getRecommended()
	const sales = await getSales()
	const resales = await getResales()
	const ethPrice = await getETHPrice()
	return {
		props: { recommends, sales, resales, ethPrice }
	}
}
export default HomePage
