import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/client'
import { checktxs, getOffersByUID, setlog } from '@/utils/datamodel'

export default async ( req: NextApiRequest, res: NextApiResponse<ApiResponse> ) => {
	try {
		const session: any = await getSession({ req })
		if (session && session.user) {
			const { id } = session.user
			await checktxs();
			const rows = await getOffersByUID(id)
			const wons:Array<OfferWithArt> = [];
			const bids:Array<OfferWithArt> = [];
			for(let v of rows) {
				if (v.status===100) {
					wons.push(v)
				} else {
					bids.push(v)
				}
			}
			return res.json({ status: 'ok', msg: {wons, bids} })
		}
	} catch (err:any) {
		setlog(err)
	}
	res.json({ status: 'err', msg: `unknown` })
}
