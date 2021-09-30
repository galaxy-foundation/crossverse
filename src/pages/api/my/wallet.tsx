import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/client'
import { setlog, setMyWallet } from '@/utils/datamodel'

export default async ( req: NextApiRequest, res: NextApiResponse<ApiResponse> ) => {
  try {
    const session: any = await getSession({ req })
    if (session && session.user) {
      const { id } = session.user
      const { address } = req.body
      const msg = await setMyWallet(id, address)
      return res.json({ status: msg===null ? 'ok' : 'err', msg })
    }
  } catch (err:any) {
    setlog(err)
  }
  res.json({ status: 'err', msg: `unknown` })
}
