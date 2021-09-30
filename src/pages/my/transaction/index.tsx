import React from 'react'
import { getSession } from 'next-auth/client'

import { Table, Tooltip } from 'antd'
import classNames from 'classnames'
import Page from '@/components/Page'
import PageTitle from '@/components/Page/Title'
import { getTxs } from '@/utils/datamodel'
import styles from './index.module.scss'
import { offsetDate } from '@/utils/helper'

const PAGE_NAME = 'Transaction History'

interface MyTransactionProps {
    data: Array<Transaction>
}

const MyTransactionPage = ({ data }: MyTransactionProps): JSX.Element => {
    const columns = [
        {
            title: 'From',
            key: 'from',
            dataIndex: 'from',
            render: (text: string) => (
                <Tooltip title={text}>
                    <div
                        className={classNames(
                            styles.clipAddress,
                            'text-truncate'
                        )}
                    >
                        {text}
                    </div>
                </Tooltip>
            ),
        },
        {
            title: 'To',
            key: 'to',
            dataIndex: 'to',
            render: (text: string) => (
                <Tooltip title={text}>
                    <div
                        className={classNames(
                            styles.clipAddress,
                            'text-truncate'
                        )}
                    >
                        {text}
                    </div>
                </Tooltip>
            ),
        },
        {
            title: 'Date',
            key: 'created',
            dataIndex: 'created',
            render: (created: number) => offsetDate(created, 0),
        },
        {
            title: 'Status',
            key: 'status',
            dataIndex: 'status',
            render: (status: number) => {
                let css = ''
                let text = ''
                if (status === 100) {
                    css = 'text-status-primary'
                    text = 'completed'
                } else if (status === 1) {
                    css = 'text-status-disabled'
                    text = 'cancelled'
                } else {
                    text = 'in progress'
                }
                return <span className={css}>{text}</span>
            },
        },
    ]

    return (
        <Page className={styles.transaction} title={PAGE_NAME}>
            <PageTitle className={styles.title} fontWeight="Bold">
                {PAGE_NAME}
            </PageTitle>
            <div className={styles.cardList}>
                <Table
                    bordered={false}
                    columns={columns}
                    dataSource={data}
                    pagination={false}
                    rowKey="id"
                />
            </div>
        </Page>
    )
}

export const getServerSideProps = async ({ req }: any):Promise<any> => {
    const session: any = await getSession({ req })
    if (session && session.user) {
        const { id } = session.user
        const data = await getTxs(id)
        return { props: { data } }
    }
    return { props: { data: [] } }
}

export default MyTransactionPage
