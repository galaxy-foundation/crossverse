import * as React from 'react'
import classNames from 'classnames'
import styles from './index.module.scss'

const Block: React.FC<ComponentBase> = ({ className, children }) => {
	return (
		<div className={classNames(styles.block, className)}>
			<div className={classNames(styles['block-inner'])}>{children}</div>
		</div>
	)
}

export default Block
