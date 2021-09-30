import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/client'
import { updateCampaign } from '@/utils/datamodel'

export default async function handler( req: NextApiRequest, res: NextApiResponse<ApiResponse> ) {
	const session: any = await getSession({ req })
	if (!(session && session.user)) return res.json({ status: 'err', msg: 'login' })
	const { id } = session.user
	if (id>=100010) return res.json({ status: 'err', msg: 'permision' })
	const result = await updateCampaign(req.body)
	res.json(result)
}
