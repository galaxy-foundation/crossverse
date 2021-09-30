import React from 'react'
import classNames from 'classnames'
import ArtworkStandard from '@/components/Artwork/Standard'
import Banner from '@/components/Carousel/Banner'
import Button from '@/components/Button'
import Page from '@/components/Page'
import { getViewURL } from '@/utils/helper'
import styles from './index.module.scss'
import { getDrops, getCampaign, getETHPrice } from '@/utils/datamodel'


const PAGE_NAME = 'Drop'

interface DropPageProp {
	isDesktop: boolean
	isMobile: boolean
	title: string
	subtitle: string
	banner: string
	lasttime: number
	arts: Array<Artwork>
	ethPrice: number
}
interface TimeLeft {
	d:number 
	h:number 
	m:number 
	s:number
}

const getLeftTime = (time:number):TimeLeft => {
	let now = Math.floor(new Date().getTime()/1000);
	let left = time - now;
	if (left<0) return { d:0, h:0, m:0, s:0 };
	return {
		d:Math.floor(left / 86400),
		h:Math.floor((left % 86400) / 3600),
		m:Math.floor((left % 3600) / 60),
		s:left % 60
	};
}

const DropPage = ({isDesktop, isMobile, title, subtitle, banner, lasttime, arts, ethPrice}: DropPageProp):JSX.Element => {
	const [time, setTime] = React.useState(getLeftTime(lasttime));
	React.useEffect(() => {
		setInterval(() => setTime(getLeftTime(lasttime)), 1000)
	}, []);

	return (
		<Page className={styles.drop} title={PAGE_NAME}>
			<div className={styles.banner}>
				<Banner dots={false} images={[{image: banner, key: 1}]}/>
			</div>
			<div className={classNames(styles.count, {[styles['count-border']]: isDesktop, [styles['count-padding']]: isDesktop, [styles['count-padding-mobile']]: isMobile})}>
				<div className={styles['count-text']}>Drop Countdown:</div>
				<div className={styles['count-text']}>{new Date(lasttime*1000).toLocaleString()}</div>
				<div className={styles[`count-time`]}>{(time.d>9?'':'0')+time.d}:{(time.h>9?'':'0')+time.h}:{(time.m>9?'':'0')+time.m}:{(time.s>9?'':'0')+time.s}</div>
			</div>
			<div className={styles.offer}>
				<div className={styles['offer-head']}>
					<div className={styles['offer-title']}>{title}</div>
					<div className={styles['offer-sub-title']}>
						{subtitle}
					</div>
				</div>
				{arts.map((v) => (
					<ArtworkStandard
						key={v.id}
						className={styles.offerv}
						artist={v.author}
						thumbnail={v.thumbnail}
						name={v.title}
						introduction={v.description}
						layout={isMobile ? 'vertical' : 'horizontal'}
						imageWidth={320}
						imageHeight={320}
						priceALT={v.price}
						priceFIAT={v.price * ethPrice}
						footer={
							<Button block className={styles.btnView} type="primary" href={getViewURL(v.id)} >
								View
							</Button>
						}
					/>
				))}
			</div>
		</Page>
	)
}

export const getServerSideProps = async (): Promise<any> => {
	const arts = await getDrops()
	const campaign = await getCampaign()
	const ethPrice = await getETHPrice()
	return {props: {...campaign, arts, ethPrice}}
}

export default DropPage
