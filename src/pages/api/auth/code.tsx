import type { NextApiRequest, NextApiResponse } from 'next'
import * as requestIp from 'request-ip'
import { sendCode } from '@/utils/datamodel'

export default async (req: NextApiRequest, res: NextApiResponse<ApiResponse>) => {
	const { email } = req.body
	if (req.method === 'POST' && email) {
		const ip = requestIp.getClientIp(req) || ''
		const result = await sendCode(email, ip)
		res.json(result)
	} else {
		res.json({ status: 'err', msg: `unknown` })
	}
}
