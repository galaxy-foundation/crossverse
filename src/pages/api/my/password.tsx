import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/client'
import { setlog, setPassword } from '@/utils/datamodel'

export default async (
	req: NextApiRequest,
	res: NextApiResponse<ApiResponse>
) => {
	try {
		const session: any = await getSession({ req })
		if (session && session.user) {
			const { id } = session.user
			const { oldpass, newpass, confirmpass } = req.body 
			if (oldpass === newpass) {
				return res.json({ status:'err', msg:'The new password is the same as the old.' })
			} else if (newpass!==confirmpass) {
				return res.json({ status:'err', msg:'The new password does not match the confirm password.' })
			} else {
				const result = await setPassword( id, oldpass, newpass )
				if (result) {
					return res.json({ status:'ok' })
				}
				return res.json({ status:'err', msg: 'failed' })
			}
		}
	} catch (err:any) {
		setlog(err)
	}
	res.json({ status: 'err', msg: `unknown` })
}
