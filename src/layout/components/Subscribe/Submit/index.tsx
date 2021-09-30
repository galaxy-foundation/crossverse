import * as React from 'react'
import { Button, Input } from 'antd'
import { InputProps } from 'antd/es'
import styles from './index.module.scss'

interface SubmitProps extends InputProps {
	onSubmit: () => void
}

const Submit: React.FC<SubmitProps> = ({className, onSubmit, ...restProps}) => {
	return (
		<div className={`${styles.submit} ${className}`}>
			<Input className={styles.ctl} {...restProps} />
			<Button className={styles.btn} onClick={onSubmit}>
				<span className={styles.icon}>
					<img alt="arrow" src="/images/arrow.png" />
				</span>
				Sign up
			</Button>
		</div>
	)
}
export default Submit
