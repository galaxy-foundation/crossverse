import * as React from 'react'
import Link from 'next/link'

interface LinkWrapProps {
	href?: string
}

/**
 * Wrap Link component
 * @constructor
 */
const LinkWrap: React.FC<LinkWrapProps> = ({ children, href }) => {
	if (href) {
		return (
			<Link href={href}>
				<a>{children}</a>
			</Link>
		)
	}

	return <>{children}</>
}

export default LinkWrap
