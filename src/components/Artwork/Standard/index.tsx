import * as React from 'react'
import { Image } from 'antd'
import classNames from 'classnames'
import LinkWrap from '@/components/LinkWrap'
/* import { toNumeral } from '@/utils/common' */
import styles from './index.module.scss'

const prefixCls = 'artworkStandard'

interface ArtworkStandardProps {
	artist?: string
	className?: string
	footer?: React.ReactNode
	name?: string
	thumbnail?: string
	introduction?: string
	href?: string
	priceALT?: number
	priceFIAT?: number
	balance?: number
	sellBalance?: number
	address?: string
	inOther?: boolean
	layout?: 'vertical' | 'horizontal'
	mode?: 'normal' | 'market'
	imageMaxWidth?: number
	imageWidth?: number
	imageHeight?: number
}

const ArtworkStandard: React.FC<ArtworkStandardProps> = ({
	artist,
	className,
	footer,
	name,
	thumbnail,
	introduction,
	href,
	priceALT,
	priceFIAT,
	balance,
	sellBalance,
	address,
	inOther,
	layout = 'vertical',
	mode = 'normal',
	imageMaxWidth,
	imageWidth,
	imageHeight,
}) => {
	return (
		
		<div
			className={classNames(styles[prefixCls], className, {
				[styles[`${prefixCls}-horizontal`]]: layout === 'horizontal',
			})}
		>
			<LinkWrap href={href}>
				<div
					className={styles[`${prefixCls}-thumbnail`]}
					style={{
							display: 'flex',
							justifyContent: 'center',
							maxWidth: imageMaxWidth || 600,
							width: imageWidth || 'auto',
							height: imageHeight || 400,
							backgroundColor: '#eee',
					}}
					>
					<img
							style={{
							objectFit: 'contain',
							maxWidth: '100%',
							maxHeight: '100%',
							}}
							/* className={styles[`${prefixCls}-thumbnail-image`]} */
							/* preview={false} */
							src={thumbnail}
					/>
					</div>
			</LinkWrap>
			<div
				className={classNames(styles[`${prefixCls}-body`], {
					[styles[`${prefixCls}-body-center`]]: layout === 'vertical',
					[styles[`${prefixCls}-body-flex`]]: layout === 'horizontal',
					[styles[`${prefixCls}-vertical-padding`]]: layout === 'vertical',
					[styles[`${prefixCls}-body-horizontal`]]: layout === 'horizontal',
				})}
			>
				<div
					className={classNames(styles[`${prefixCls}-body-inner`], {
						[styles[`${prefixCls}-body-inner-stretch`]]: footer,
					})}
				>
					<div
						className={classNames(
							styles[`${prefixCls}-name`],
							styles[`${prefixCls}-text`],
							styles[`${prefixCls}-text-title`]
						)}
					>
						{name}
					</div>
					<div className={classNames(styles[`${prefixCls}-artist`])}>
						{artist}
					</div>
					{mode === 'normal' && (
						<div className={classNames(styles[`${prefixCls}-introduction`])}>
							{introduction}
						</div>
					)}
					{mode === 'market' && (
						<div className={styles[`${prefixCls}-price`]}>
							<Image
								className={styles[`${prefixCls}-icon`]}
								alt="eth"
								preview={false}
								src="/images/eth.png"
							/>
							<div className={styles[`${prefixCls}-price-content`]}>
								<div className={styles[`${prefixCls}-price-alt`]}>
									{Number(priceALT?.toFixed(6)) || 0} ETH
								</div>
								<div className={styles[`${prefixCls}-price-fiat`]}>
									${priceFIAT?.toFixed(2)}
								</div>
							</div>
						</div>
					)}
					{balance ? (
						<div className={styles[`${prefixCls}-price-content`]}>
							Quantity: {balance} { sellBalance ? ' / ' + sellBalance : ''}
						</div>
					) : null}
					{address ? (
						<div className={styles[`${prefixCls}-price-content`]}>
							Stored in { inOther ? <span style={{color:'red'}}>Other Wallet</span> : <span style={{color:'green'}}>{address.slice(0,6) + '...' + address.slice(-4)}</span> }
						</div>
					) : null}
				</div>
				{footer && (
					<div className={styles[`${prefixCls}-body-footer`]}>{footer}</div>
				)}
			</div>
		</div>
	)
}

export default ArtworkStandard
