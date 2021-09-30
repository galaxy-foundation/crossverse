import React from 'react'
import Link from 'next/link'
import Page from '@/components/Page'

const SignError: React.FC = () => {
  return (
    <Page title="Authorization Error">
      <div style={{ textAlign: 'center', padding: 30 }}>
        <h2 style={{ padding: 20 }}>Authorization Error</h2>
        <div>
          <Link href="/signin">Try again</Link>
        </div>
      </div>
    </Page>
  )
}

export default SignError
