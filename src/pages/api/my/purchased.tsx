import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/client'
import { checktxs, getPurchased, setlog } from '@/utils/datamodel'

export default async ( req: NextApiRequest, res: NextApiResponse<ApiResponse> ) => {
  try {
    const session: any = await getSession({ req })
    if (session && session.user) {
      const { id } = session.user
      await checktxs();
      return res.json({ status: 'ok', msg:await getPurchased(id) })
    }
  } catch (err:any) {
    setlog(err)
  }
  res.json({ status: 'err', msg: `unknown` })
}
