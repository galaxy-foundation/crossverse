import React from 'react'
import Button from '@/components/Button'
import Page from '@/components/Page'
import PageTitle from '@/components/Page/Title'
import styles from './index.module.scss'
import useWallet from '@/utils/useWallet'

const PAGE_NAME = 'Get Wallet'
/* const tools = [
    {
        key: 'coinbase',
        icon: 'walletlink.webp',
    },
    {
        key: 'trust',
        icon: 'walletconnect.webp',
    },
    {
        key: 'bitski',
        icon: 'bitski.png',
    },
    {
        key: 'fortmatic',
        icon: 'fortmatic.png',
    },
    {
        key: 'arkane',
        icon: 'arkane.svg',
    },
] */

const WalletConnectPage = (): JSX.Element => {
    const wallet = useWallet(true)
    return (
        <Page className={styles.connect} title={PAGE_NAME}>
            <div className={styles.card}>
                <PageTitle className={styles.title} fontWeight="Medium">
                    You need an Ethereum wallet to use Cross Verse
                </PageTitle>
                <div className={styles.wallet}>
                    <div className={styles.logo}>
                        <img className={styles.img} src="/images/logos/metamask.png"/>
                    </div>
                    {wallet.connected ? (
                        <h1>{wallet.address.slice(0, 12) + '......' + wallet.address.slice(-8)}</h1>
                    ) : (
                        <>
                            <h2 style={{ color: 'red', marginBottom: 20 }}>{wallet.err}</h2>
                            <Button onClick={wallet.connect} loading={wallet.connecting} block wrapClassName={styles.btn} type="primary">
                                Get MetaMask
                            </Button>
                        </>
                    )}
                </div>

                {/* <div className={styles.others}>
                    <PageTitle className={styles.title} fontWeight="Medium">
                        Other Wallets
                    </PageTitle>
                    <div className={styles.options}>
                        {tools.map((tool) => (
                            <div key={tool.key} className={styles.option}>
                                <img className={styles['option-img']} alt={tool.key} src={`/images/logos/${tool.icon}`} />
                            </div>
                        ))}
                    </div>
                </div> */}
            </div>
        </Page>
    )
}

export default WalletConnectPage
