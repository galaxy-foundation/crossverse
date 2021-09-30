import React from 'react'
import { Input, InputProps } from 'antd'
import classNames from 'classnames'
import styles from './index.module.scss'
import { getQueryVariable } from '@/utils/helper'

interface SearchProps extends InputProps {
	circle?: boolean
}

const prefixCls = 'search'

const Search: React.FC<SearchProps> = ({ className, ...restProps }) => {
	const [query, setQuery] = React.useState('')
	const onSearch = (e:any) => {
		window.open('/marketplace?q=' + e.target.value.replace(/[&\/\\#,+()$~%.'":*?<>{} ]/g, '').trim(), '_self')
	}
	React.useEffect(()=>{
		const query = getQueryVariable('q');
		if (query) setQuery(query)
	}, [])
	return (
		<Input
			onKeyDown={(e)=>e.keyCode===13 && onSearch(e)}
			className={classNames(className, styles[prefixCls], {
				[styles[`${prefixCls}-padding`]]: true,
				[styles[`${prefixCls}-group`]]: true,
			})}
			{...restProps}
			value={query}
			onChange={(e)=>setQuery(e.target.value)}
			minLength={2}
			maxLength={20}
			addonBefore={
				<img
					className={styles[`${prefixCls}-icon`]}
					alt="icon"
					src="/images/search.png"
				/>
			}
		/>
	)
}

export default Search
