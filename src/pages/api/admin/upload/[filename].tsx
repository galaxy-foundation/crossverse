import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import getConfig from 'next/config'
const { serverRuntimeConfig } = getConfig()
const temp = serverRuntimeConfig.PROJECT_ROOT + '/tmp'

export default async function handler( req: NextApiRequest, res: NextApiResponse ) {
	try {
		const filename = temp + '/upload_' + req.query.filename
		const exist = fs.existsSync(filename)
		if (!exist) {
			res.statusCode = 404
			res.end(`File ${filename} not found!`)
		} else {
			const data = fs.readFileSync(filename)
			res.setHeader('Content-type', 'application/octlet')
			res.end(data)
		}
	} catch(err) {
		res.statusCode = 500
		res.end(`Error getting the file: ${err}.`)
	}
}
