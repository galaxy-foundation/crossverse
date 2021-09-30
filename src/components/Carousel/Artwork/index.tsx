import React from 'react'
import { Carousel, Col, Row } from 'antd'
import classNames from 'classnames'
import chunk from 'lodash/chunk'
import map from 'lodash/map'
import ArtworkStandard from '@/components/Artwork/Standard'
import { getViewURL } from '@/utils/helper'
import styles from './index.module.scss'

interface CarouselArtworkProps {
	className?: string
	dataSource?: Array<any>
	isMobile?: boolean
}

const CarouselArtwork: React.FC<CarouselArtworkProps> = ({className, dataSource, isMobile}) => {
	const chunkSize = isMobile ? 1 : 3
	const displayWorkList = chunk(dataSource, chunkSize)

	return (
		<Carousel className={classNames(styles.carouselArtwork, className)}>
			{map(displayWorkList, (row, index) => {
				if (isMobile) {
					return map(row, (column) => (
						<ArtworkStandard
							key={`row_${index}_${column.id}`}
							className={styles.offerItem}
							artist={column.author}
							thumbnail={column.thumbnail}
							mode="normal"
							name={column.title}
							introduction={column.description}
							href={getViewURL(column.id)}
						/>
					))
				}
				return (
					<div key={index} className={`row_${index}`}>
						<Row gutter={64}>
							{map(row, (column) => (
								<Col flex={1} span={8} key={`row_${index}_${column.id}`}>
									<ArtworkStandard
										key={`row_${index}_${column.id}`}
										className={styles.offerItem}
										artist={column.author}
										thumbnail={column.thumbnail}
										name={column.title}
										introduction={column.description}
										href={getViewURL(column.id)}
									/>
								</Col>
							))}
						</Row>
					</div>
				)
			})}
		</Carousel>
	)
}
export default CarouselArtwork
