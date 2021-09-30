import * as React from 'react'
import { Button, Input } from 'antd'
import classNames from 'classnames'
import { InputProps } from 'antd/es'
import styles from './index.module.scss'

interface SubmitProps extends InputProps {
	onSubmit: () => void
}

const Submit: React.FC<SubmitProps> = ({className, children, onSubmit, ...restProps}) => {
	return (
		<div className={classNames(styles.submit, className)}>
			<Input className={styles.ctl} {...restProps} />
			<Button className={styles.btn} onClick={onSubmit}>
				<span className={styles.icon}>
					<img alt="arrow" src="/images/arrow.png" />
				</span>
				{children}
			</Button>
		</div>
	)
}
export default Submit
