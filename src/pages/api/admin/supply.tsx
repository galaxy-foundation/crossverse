import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/client'
import { updateArtSupply } from '@/utils/datamodel'

export default async function handler( req: NextApiRequest, res: NextApiResponse<ApiResponse> ) {
	const session: any = await getSession({ req })
	if (!(session && session.user)) return res.json({ status: 'err', msg: 'login' })
	const { id } = session.user
	if (id>=100010) return res.json({ status: 'err', msg: 'permision' })
	const {tokenid, quantity} = req.body;
	const result = await updateArtSupply(tokenid, quantity)
	res.json(result)
}
