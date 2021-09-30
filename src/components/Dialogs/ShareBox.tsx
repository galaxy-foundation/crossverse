import React from 'react'
import { Button, Modal } from 'antd'
import { copyToClipboard } from '@/utils/helper'

interface ShareBoxProps {
	onClose: () => void
	url: string
	visible:boolean
}

const ShareBox: React.FC<ShareBoxProps> = ({ url, visible, onClose }) => {
	return (
		<Modal visible={visible} title="Share this URL" onCancel={onClose} footer={[
			<Button key="copy" onClick={()=>copyToClipboard(url)}>Copy To Clipboard</Button>, 
			<Button key="back" onClick={onClose}> Close </Button> 
		]}>
			<a>{url}</a>
		</Modal>
	)
}

export default ShareBox
