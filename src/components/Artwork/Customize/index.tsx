import React from 'react'
import classNames from 'classnames'
import styles from './index.module.scss'

const prefixCls = 'artworkCustomize'

interface ArtworkCustomizeProps {
	className?: string
	name?: string
	thumbnail: string
	file: string
	isVideo: boolean
	isMusic: boolean
	layout: 'vertical' | 'horizontal'
}

const ArtworkCustomize: React.FC<ArtworkCustomizeProps> = ({
	className,
	children,
	name,
	thumbnail,
	file,
	isVideo,
	isMusic,
	layout = 'vertical',
}) => {
	const [playing, setPlaying] = React.useState(false)
	const vidRef = React.useRef<HTMLVideoElement>(null)
	const audRef = React.useRef<HTMLAudioElement>(null)

	const play = () => {
		if (isMusic) {
			audRef.current?.play()
		} else if (isVideo) {
			vidRef.current?.play()
		}
		setPlaying(true)
	}
	const pause = () => {
		if (isMusic) {
			audRef.current?.pause()
		} else if (vidRef) {
			vidRef.current?.pause()
		}
		setPlaying(false)
	}
	React.useEffect(() => {
		if (isMusic) {
			audRef.current?.addEventListener('ended', () => setPlaying(false))
		}

		return () => {
			if (isMusic) {
				audRef.current?.removeEventListener('ended', () => setPlaying(false))
			}
		}
	}, [])

	return (
		<div
			className={classNames(styles[prefixCls], className, {
				[styles[`${prefixCls}-horizontal`]]: layout === 'horizontal',
			})}
		>
			<div className={styles[`${prefixCls}-thumbnail`]}>
				<div>
					{isVideo ? (
						<video autoPlay ref={vidRef}>
							<source src={file} type="video/mp4" />
						</video>
					) : (
						<img
							className={styles[`${prefixCls}-thumbnail-image`]}
							alt={name}
							src={isMusic ? thumbnail : file}
							style={{maxHeight:500}}
						/>
					)}
					{isMusic ? <audio src={file} ref={audRef} /> : null}
				</div>
				{isMusic || isVideo ? (
					<div className={styles[`${prefixCls}-thumbnail-controls`]}>
						<div className={styles[`${prefixCls}-thumbnail-icon`]}>
							<a onClick={play}>
								<img
									className={styles[`${prefixCls}-thumbnail-icon-sound`]}
									alt="sound"
									src="/images/icons/sound.png"
								/>
							</a>
						</div>
						{playing ? (
							<div className={styles[`${prefixCls}-thumbnail-icon`]}>
								<a onClick={pause}>
									<img
										className={styles[`${prefixCls}-thumbnail-icon-pause`]}
										alt="pause"
										src="/images/icons/pause.png"
									/>
								</a>
							</div>
						) : null}
					</div>
				) : null}
			</div>
			<div className={classNames(styles[`${prefixCls}-body`])}>{children}</div>
		</div>
	)
}

export default ArtworkCustomize
