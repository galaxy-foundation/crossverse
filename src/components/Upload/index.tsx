import React from 'react'
import { Upload as AUpload } from 'antd'
import classNames from 'classnames'
import styles from './index.module.scss'

const prefixCls = 'upload'

interface UploadProps {
	action?: string
	circle?: boolean
	className?: string
	value?: string
	onChange?: (value?: string) => void
}

const Upload: React.FC<UploadProps> = ({action, circle, className, value, onChange}) => {
	const getBase64 = (img: Blob, callback: (v: any) => void) => {
		const reader = new FileReader()
		reader.addEventListener('load', () => callback(reader.result))
		reader.readAsDataURL(img)
	}

	const handleChange = (info: any) => {
		if (info.file.status === 'uploading') {
			return
		}
		if (info.file.status === 'done') {
			getBase64(info.file.originFileObj,(url: string) => onChange && onChange(url))
		}
	}

	return (
		<AUpload className={classNames(styles[prefixCls], className, {[styles[`${prefixCls}-circle`]]: circle})} action={action} listType="picture-card" showUploadList={false} onChange={handleChange} >
			<div className={styles[`${prefixCls}-btn`]}>
				<div className={classNames(styles[`${prefixCls}-preview`], { [styles[`${prefixCls}-preview-circle`]]: circle})}>
					<img className={classNames(styles[`${prefixCls}-placeholder`], { [styles[`${prefixCls}-picture`]]: value, })} src={value || '/images/icons/picture.png'} alt="image" />
				</div>
				<div className={styles[`${prefixCls}-camera`]}>
					<img className={styles[`${prefixCls}-camera`]} src="/images/icons/camera.png" alt="camera" />
				</div>
			</div>
		</AUpload>
	)
}

export default Upload
