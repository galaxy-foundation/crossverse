import React, { FC } from 'react'
import { AppProps } from 'next/app'
import Head from 'next/head'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'antd/dist/antd.css'
import { getPageName } from '@/utils/common'
import Layout from '@/layout'
/* import { storeWrapper } from '@/store/store2' */
import '@/common/css/layout.scss'
import store from '@/store/store'
import { Provider } from 'react-redux'
import { Provider as AuthProvider } from 'next-auth/client'
/* import { UseWalletProvider } from 'use-wallet' */
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

dayjs.extend(duration)
dayjs.extend(relativeTime)

/**
 * withRedux HOC
 * NextJS wrapper for Redux
 */

const CustomApp: FC<AppProps> = ({ Component, pageProps }) => {
	return (
		
		<AuthProvider options={{ clientMaxAge: 0, keepAlive: 0 }} session={pageProps.session} >
			<Provider store={store}>
				<Head>
				<meta charSet="UTF-8" />
				<meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
				<meta name="keywords" content="" />
				<meta name="description" content="" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover" />
				<meta name="author" content="" />
				<meta name="renderer" content="webkit" />
				<title>{getPageName()}</title>
				</Head>
				<Layout>
					<Component {...pageProps} />
				</Layout>
				<ToastContainer />
			</Provider>
		</AuthProvider>
	)
}

export default CustomApp
