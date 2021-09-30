import React from 'react'
import Link from 'next/link'
import classNames from 'classnames'
import chunk from 'lodash/chunk'
import map from 'lodash/map'
import styles from './index.module.scss'

const prefixCls = 'links'

interface LinksProps {
	links: any[]
	layout: 'block' | 'wrap'
}

const Links: React.FC<LinksProps> = ({ links, layout }) => {
	const group = chunk(links, layout === 'wrap' ? 3 : 5)

	return (
		<div className={classNames(styles[prefixCls], styles[`${prefixCls}-${layout}`])}>
			{map(group, (row, index) => (
				<div key={`row_${index}`} className={classNames(styles[`${prefixCls}-row`], { [styles[`${prefixCls}-row-flex`]]: layout === 'wrap'})}>
					{map(row, (v) => (
						<Link key={v.title} href={v.href}>
							<a className={classNames(styles[`${prefixCls}-link`], { [styles[`${prefixCls}-link-large`]]: layout === 'wrap'})}>
								{v.title}
							</a>
						</Link>
					))}
				</div>
			))}
		</div>
	)
}

export default Links
