import React from 'react'
import { Form, Row } from 'antd'
import Link from 'next/link'
import Page from '@/components/Page'
import PageTitle from '@/components/Page/Title'
import Submit from '@/components/Input/Submit'
import styles from './index.module.scss'

const PAGE_NAME = 'Reset password'

const ResetPasswordPage: React.FC = () => {
  const [form] = Form.useForm()

  const onFinish = () => {
    /* console.log('Success:') */
  }

  return (
    <Page className={styles.reset} title={PAGE_NAME}>
      <div className={styles.card}>
        <PageTitle className={styles.title} fontWeight="Medium">
          Send password reset email
        </PageTitle>
        <Row justify="center">
          <Form
            className={`${styles.form} ant-col`}
            form={form}
            style={{ flex: '1 1 auto' }}
            onFinish={onFinish}
          >
            <Form.Item
              className={styles.formItem}
              name="password"
              rules={[
                {
                  required: true,
                  message: 'Password required',
                },
              ]}
            >
              <Submit placeholder="Your login email" onSubmit={onFinish} />
            </Form.Item>
            <div className={styles.links}>
              <a>Resend email</a>
              <Link href="/signup">
                <a>Sign Up</a>
              </Link>
            </div>
          </Form>
        </Row>
      </div>
    </Page>
  )
}

export default ResetPasswordPage
