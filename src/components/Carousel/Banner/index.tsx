import * as React from 'react'
import { Carousel, Image } from 'antd'
import styles from './index.module.scss'
import classNames from 'classnames'

type BannerLinks = {
	image: string
	src?: string
	key: string | number
}

interface CarouselBannerProps {
	dots?: boolean
	images: BannerLinks[]
}

const CarouselBanner: React.FC<CarouselBannerProps> = ({ dots, images }) => {
	return (
		<Carousel autoplay className={classNames(styles.carouselBanner, { [styles.carouselNoPadding]: !dots, })} dots={dots}>
			{images.map(v => <Image key={v.key} alt="carousel" preview={false} src={v.image} />)}
		</Carousel>
	)
}

export default CarouselBanner
