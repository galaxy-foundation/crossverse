import React from 'react'
import Link from 'next/link'
import { Avatar } from 'antd'
import classNames from 'classnames'
import DropDown from './DropDown'
import styles from './index.module.scss'
import { useSession } from 'next-auth/client'
import useWallet from '@/utils/useWallet'
const prefixCls = 'nav'

interface NavProps {
    collapsed?: boolean
    expand?: boolean
}

const Nav: React.FC<NavProps> = ({ collapsed, expand }) => {
    const session: any = useSession()
    const isSigned = !!(session && session[0])
    const email = session && session[0] && session[0].user && session[0].user.email
    const wallet = useWallet(true);
    return (
        <div className={classNames(styles[prefixCls], {[styles[`${prefixCls}-collapsed`]]: collapsed, [styles[`${prefixCls}-expand`]]: collapsed && expand})}>
            <ul className={styles[`${prefixCls}-nav`]}>
                <li className={styles[`${prefixCls}-nav-item`]}>
                    <Link href="/">Home</Link>
                </li>
                <li className={styles[`${prefixCls}-nav-item`]}>
                    <Link href="/drop">Drop</Link>
                </li>
                <li className={styles[`${prefixCls}-nav-item`]}>
                    <Link href="/marketplace">Marketplace</Link>
                </li>
                <li className={styles[`${prefixCls}-nav-item`]}>
                    <Link href="/about">About us</Link>
                </li>
                <li className={styles[`${prefixCls}-divider`]} />
                {isSigned ? (
                    <li className={styles[`${prefixCls}-nav-item`]}>
                        <Link href="/wallet/connect">{wallet.connected ? '🦊 ' + wallet.address.slice(0,6)+'...'+wallet.address.slice(-4) : (wallet.connecting?'🦊 connecting...':'🦊 connect wallet')}</Link>
                    </li>
                ) : null}
                {isSigned ? (
                    <li className={classNames({[styles[`${prefixCls}-nav-item`]]: collapsed})}>
                        <DropDown>
                            <Avatar size={60}>
                                {email.slice(0, 2).toUpperCase()}
                            </Avatar>
                        </DropDown>
                    </li>
                ) : (
                    <li className={styles[`${prefixCls}-nav-item`]}>
                        <Link href="/signin">Login</Link>
                    </li>
                )}
            </ul>
        </div>
    )
}

export default Nav
