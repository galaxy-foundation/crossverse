import React from 'react'
import Link from 'next/link'
import { Popover } from 'antd'
import styles from './index.module.scss'
import { signOut, useSession } from 'next-auth/client'
const prefixCls = 'dropdown'

const DropDown: React.FC = ({ children }) => {
    const session: any = useSession()
    const content = (
        <div className={styles[`${prefixCls}-content`]}>
            <div className={styles[`${prefixCls}-head`]}>
                <div>
                    <div>
                        Welcome back,{' '}
                        {session &&
                            session[0] &&
                            session[0].user &&
                            session[0].user.email.match(/^.+(?=@)/)[0]}
                    </div>
                    <div></div>
                </div>
                <div>{children}</div>
            </div>
            <div className={styles[`${prefixCls}-divider`]} />
            <div className={styles[`${prefixCls}-links`]}>
                <ul className={styles[`${prefixCls}-links-nav`]}>
                    <li className={styles[`${prefixCls}-links-item`]}>
                        <Link href="/my/profile">My profile</Link>
                    </li>
                    <li className={styles[`${prefixCls}-links-item`]}>
                        <Link href="/my/purchased">My Purchased</Link>
                    </li>
                    <li className={styles[`${prefixCls}-links-item`]}>
                        <Link href="/my/order">My order</Link>
                    </li>
                    <li className={styles[`${prefixCls}-links-item`]}>
                        <Link href="/my/favorite">My favorite</Link>
                    </li>
                    <li className={styles[`${prefixCls}-links-item`]}>
                        <Link href="/my/transaction">Transaction history</Link>
                    </li>
                    <li className={styles[`${prefixCls}-links-item`]}>
                        <Link href="/my/account">Account setting</Link>
                    </li>
                    <li className={styles[`${prefixCls}-links-item`]}>
                        <Link href="/wallet/connect">Connect wallet</Link>
                    </li>
                </ul>
            </div>
            <div className={styles[`${prefixCls}-logout`]}>
                <a onClick={() => signOut()}>Log out</a>
            </div>
        </div>
    )

    return (
        <Popover
            align={{
                points: ['cr', 'cl'],
                overflow: {
                    adjustX: 1,
                    adjustY: 1,
                },
                offset: [78, 214],
                targetOffset: [0, 0],
            }}
            content={content}
            overlayClassName={styles[prefixCls]}
        >
            {children}
        </Popover>
    )
}

export default DropDown
