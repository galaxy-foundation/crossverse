import React  from 'react'
import { Row, Col } from 'antd'
import classNames from 'classnames'
import ArtworkStandard from '@/components/Artwork/Standard'
import Page from '@/components/Page'
import PageTitle from '@/components/Page/Title'
import { ROW_THREE_ITEMS } from '@/config'
import { getPageName } from '@/utils/common'
import { getViewURL } from '@/utils/helper'
import styles from './index.module.scss'
import { getLikes } from '@/utils/datamodel'
import { getSession } from 'next-auth/client'

const PAGE_NAME = 'My Favorite'

interface MyFavoriteProps {
    data: Array<Artwork>
}

const MyFavoritePage = ({ data }: MyFavoriteProps):JSX.Element => {
  return (
    <Page className={styles.favorite} title={getPageName(PAGE_NAME)}>
      <PageTitle className={styles.title} fontWeight="Bold">
        {PAGE_NAME}
      </PageTitle>
      <div className={classNames(styles.cardList, styles.cardPadding)}>
        <Row gutter={32}>
          {data.map((item) => (
            <Col {...ROW_THREE_ITEMS} key={item.id}>
              <ArtworkStandard
                className={styles.favoriteItem}
                artist={item.author}
                thumbnail={item.thumbnail}
                mode="normal"
                name={item.title}
                introduction={item.description}
                href={getViewURL(item.id)}
              />
            </Col>
          ))}
        </Row>
      </div>
    </Page>
  )
}
export async function getServerSideProps({ req }: any) {
  const session: any = await getSession({ req })
  if (session && session.user) {
    const { id } = session.user
    const data = await getLikes(id)
    return {
      props: { data }
    }
  }
  return {
    props: {}
  }
}
export default MyFavoritePage
