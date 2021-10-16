import React from 'react'
import Page from '@/components/Page'
import Button from '@/components/Button'

const SignError: React.FC = () => {
  return (
    <Page title="Authorization Error">
      <div style={{ textAlign: 'center', padding: 30 }}>
        <h2 style={{ padding: 20 }}>Authorization Error</h2>
        <div style={{marginTop:20, marginBottom:50}}>
          <Button href="/signin" style={{width:200}} type="primary" htmlType="submit">
            Try again
          </Button>
        </div>
      </div>
    </Page>
  )
}

export default SignError
