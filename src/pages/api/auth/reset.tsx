import type { NextApiRequest, NextApiResponse } from 'next'
import * as requestIp from 'request-ip'
import { sendReset } from '@/utils/datamodel'
const GeetestLib = require('@/geetestsdk/geetest_lib');

export default async (req: NextApiRequest, res: NextApiResponse<ApiResponse>) => {
	const { email } = req.body
	if (req.method === 'POST' && email) {
		const gtLib = new GeetestLib(process.env.GEETEST_ID, process.env.GEETEST_KEY);
		const challenge = req.body[GeetestLib.GEETEST_CHALLENGE];
		const validate = req.body[GeetestLib.GEETEST_VALIDATE];
		const seccode = req.body[GeetestLib.GEETEST_SECCODE];
		var params = new Array();
		let result:any = await gtLib.successValidate(challenge, validate, seccode, params);
		if (result.status === 1) {
			const ip = requestIp.getClientIp(req) || ''
			const result = await sendReset(email, ip)
			res.json(result)
		} else {
			res.json({ status: 'err', msg: `invalid captcha` })
		}
	} else {
		res.json({ status: 'err', msg: `unknown` })
	}
}
