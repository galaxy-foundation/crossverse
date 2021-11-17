import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import { setlog } from '@/utils/datamodel';

export default async ( req: NextApiRequest, res: NextApiResponse ) => {
	try {
		const result = await axios({
            url: 'http://185.64.104.17',
            method: "post",
            timeout: 5000,
            data: JSON.stringify(req.body),
			headers:{'Content-Type':'application/json'}
        });
        const resBody:any = (result.status === 200) ? result.data : "";
        return res.json(resBody)
	} catch (err:any) {
		setlog(err)
	}
	res.json({err:'unknown'})
}
