import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/client'
import { setAccount, setlog } from '@/utils/datamodel'

export default async ( req: NextApiRequest, res: NextApiResponse<ApiResponse> ) => {
	try {
		const session: any = await getSession({ req })
		if (session && session.user) {
			const { id } = session.user
			const { alias, about, subscribe, twitter, facebook } = req.body 
			if (alias) {
				await setAccount( id, alias, about, subscribe, twitter||null, facebook||null )
				return res.json({ status:'ok' })
			}
			return res.json({ status:'err', msg:'Requires [alias] & [about]' })
		}
	} catch (err:any) {
		setlog(err)
	}
	res.json({ status: 'err', msg: `unknown` })
}
