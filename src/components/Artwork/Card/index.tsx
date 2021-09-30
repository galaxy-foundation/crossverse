import * as React from 'react'
import classNames from 'classnames'
import LinkWrap from '@/components/LinkWrap'
import styles from './index.module.scss'

const prefixCls = 'artworkCard'

interface ArtworkCardProps {
	artist?: string
	name?: string
	priceALT?: number
	priceFIAT?: number
	thumbnail?: string
	href?: string
	layout?: 'top' | 'left'
	extra?: React.ReactNode
}

const ArtworkMini: React.FC<ArtworkCardProps> = ({artist, name, thumbnail, priceALT, priceFIAT, href, extra}) => {
	return (
		<LinkWrap href={href}>
			<div className={styles[prefixCls]}>
				<div className={styles[`${prefixCls}-wrap`]}>
					<div className={styles[`${prefixCls}-thumbnail`]} style={{ display: 'flex', width: 120, height: 120, backgroundColor: '#eee'}}>
						<img alt={name} src={thumbnail} style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '100%', }}/>
					</div>
					<div className={styles[`${prefixCls}-content`]}>
						<div className={styles[`${prefixCls}-left`]}>
							<div className={styles[`${prefixCls}-leftTop`]}>
								<div className={styles[`${prefixCls}-content-artist`]}>
									{artist}
								</div>
								<div className={classNames(`${styles[`${prefixCls}-content-name`]}`, 'text-truncate')}>
									{name}
								</div>
							</div>
						</div>
						<div
							className={classNames(
								styles[`${prefixCls}-right`],
								styles[`${prefixCls}-flex`]
							)}
						>
							<div className={styles[`${prefixCls}-rightTop`]}>
								<div className={styles[`${prefixCls}-content-alt`]}>
									{Number(priceALT?.toFixed(6))} ETH
								</div>
								<div className={styles[`${prefixCls}-content-fiat`]}>
									$ {priceFIAT?.toFixed(2)}
								</div>
							</div>
							<div className={styles[`${prefixCls}-rightBottom`]}>
								{extra && (
									<div className={styles[`${prefixCls}-content-extra`]}>
										{extra}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</LinkWrap>
	)
}

export default ArtworkMini
