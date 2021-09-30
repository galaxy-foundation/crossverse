import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/client'
import { admin_set_arts, setlog } from '@/utils/datamodel'

export default async ( req: NextApiRequest, res: NextApiResponse<ApiResponse> ): Promise<any> => {
	try {
		const session: any = await getSession({ req })
		if (!(session && session.user)) return res.json({ status: 'err', msg: 'login' })
		const { id } = session.user
		if (id>=100010) return res.json({ status: 'err', msg: 'permision' })
		const page = req.query.page
		const { act, msg } = req.body
		if (page==='arts') {
			if (act==='update') {
				await admin_set_arts(msg);
				return res.json({ status: 'ok' })
			}
		}
		
	} catch (err:any) {
		setlog(err)
	}
	res.json({ status: 'err', msg: 'unknown' })
}
