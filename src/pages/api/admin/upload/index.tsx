import type { NextApiRequest, NextApiResponse } from 'next'
import path from 'path'
import getConfig from 'next/config'

import formidable from 'formidable'

const { serverRuntimeConfig } = getConfig()
const temp = serverRuntimeConfig.PROJECT_ROOT + '/tmp'

const getFileFromRequest = (req: any) => {
	return new Promise((resolve) => {
		const form = new formidable.IncomingForm({ uploadDir: temp })
		form.parse(req, async (err: any, flds: any, files: any) => {
			
			if (files) {
				const result = []
				for (const k in files) result.push(files[k])
				return resolve(result)
			} else {
				console.log(err, flds)
			}
			resolve(null)
		})
	})
}

export const config = {
	api: {
		bodyParser: false,
	}
}

export default async function handler( req: NextApiRequest, res: NextApiResponse ) {
	if (req.method === 'POST') {
		const files: any = await getFileFromRequest(req)
		if (files.length) {
			const fileid = files[0].path.slice(files[0].path.lastIndexOf(path.sep) + 1).slice(7)
			const ext = files[0].name.slice(files[0].name.lastIndexOf('.') + 1)
			return res.status(200).send({ fileid, ext })
		}
	}
	res.status(501).send('invalid request')
}
