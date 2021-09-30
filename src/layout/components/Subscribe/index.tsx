import React from 'react'
import classNames from 'classnames'
import Submit from './Submit'
import styles from './index.module.scss'

const prefixCls = 'subscribe'

interface SubscribeProps {
	simple?: boolean
}

const Subscribe: React.FC<SubscribeProps> = ({ simple }) => {
	const [email, setEmail] = React.useState('')
	const handleSubmit = () => {
		if (email) window.open('/signup?q='+email, '_self')
	}
	return (
		<div className={classNames(styles[prefixCls], {[styles[`${prefixCls}-normal`]]: !simple, [styles[`${prefixCls}-simple`]]: simple})}>
			{simple ? null : (
				<div className={styles[`${prefixCls}-loop`]}>
					<div className={styles[`${prefixCls}-loop-title`]}>
						Stay in the loop
					</div>
					<div className={styles[`${prefixCls}-loop-content`]}>
						Join our mailing list to stay in the loop with out latest
						features,NTF drops, and tips and tricks on Cross Verse.
					</div>
					<Submit className={styles[`${prefixCls}-signup`]} onChange={(e: any) => setEmail(e.target.value)} placeholder="Your email address" onSubmit={handleSubmit}/>
				</div>
			)}
			<div className={classNames(styles[`${prefixCls}-community`], {[styles[`${prefixCls}-center`]]: simple})}>
				<div className={styles[`${prefixCls}-subTitle`]}>
					Join the community
				</div>
				<div className={styles[`${prefixCls}-brand`]}>
					<a href="#">
						<img className={styles[`${prefixCls}-icon`]} alt="twitter" src="/images/twitter.png"/>
					</a>
					<a href="#">
						<img className={styles[`${prefixCls}-icon`]} alt="instagram" src="/images/instagram.png"/>
					</a>
					<a href="#">
						<img className={styles[`${prefixCls}-icon-studio`]} src="/images/cs-logo.png" alt="cross-studio"/>
					</a>
				</div>
			</div>
		</div>
	)
}

export default Subscribe
