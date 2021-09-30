import type { NextApiRequest, NextApiResponse } from 'next'
import { register } from '@/utils/datamodel'
import * as requestIp from 'request-ip'

export default async (
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) => {
  if (req.method === 'POST') {
    const { alias, email, password, phone, code } = req.body
    const ip = requestIp.getClientIp(req) || ''
    const result = await register(alias, email, password, phone, code, ip)
    res.json(result)
  } else {
    res.json({ status: 'err', msg: `unknown` })
  }
}
