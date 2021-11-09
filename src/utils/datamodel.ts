import JSBI from 'jsbi'
import sizeOf from 'image-size'
import sharp from 'sharp'
import { Storage } from '@google-cloud/storage'
import MySQLModel from './MySQLModel'
import { call, hash, now, generateCode, fromEther, toEther, generatePassword } from './helper'
import { Html_Register, Html_Reset } from './email-template'
/* import gmail from './gmail' */
import fs from 'fs'
import path from 'path'
import getConfig from 'next/config'
import Web3 from 'web3'
import abiStorefront from '@/config/abi/storefront.json'
import abiWETH from '@/config/abi/weth.json'
import Config from '@/config/v1.json'

import fsExtra from 'fs-extra'
import axios from 'axios'
import * as nodemailer from 'nodemailer'

const SMTPHOST = process.env.SMTP || ''
const SMTPPORT = Number(process.env.SMTP_PORT)
const SMTPUSER = process.env.SMTP_USER || ''
const SMTPPASS = process.env.SMTP_PSSS || ''
console.log(SMTPPORT)



const e8 = JSBI.BigInt(1e8)

const { parseLog } = require('./ethereum-event-logs')

const conf = (Config as CONFIG)[Number(process.env.CHAINID || 1)]
const confirmations = conf.confirmations

const privkey = process.env.SIGNERKEY || ''
const signer = process.env.SIGNER

const web3 = new Web3(conf.rpc)

const Nfts = new MySQLModel('nfts')
const Arts = new MySQLModel('arts')
const Artviews = new MySQLModel('artviews')
const Artlikes = new MySQLModel('artlikes')
const Users = new MySQLModel('users')
const Wallets = new MySQLModel('wallets', 'key')
const Userlog = new MySQLModel('userlog')
const Authcodes = new MySQLModel('authcodes', 'email')
const Trades = new MySQLModel('trades')
const Offers = new MySQLModel('offers', 'txid')
const Txs = new MySQLModel('txs', 'txid')
const Campaigns = new MySQLModel('campaigns')
const ConfigData = new MySQLModel('config', 'key')

const { serverRuntimeConfig } = getConfig()

const keyFilename = path.join( serverRuntimeConfig.PROJECT_ROOT, './src/config/gcp.json' )

console.log(keyFilename);

const storage = new Storage({ keyFilename })
const bucketName: string = process.env.GOOGLE_BUCKET || ''
const bucket = storage.bucket(bucketName)
const temp = serverRuntimeConfig.PROJECT_ROOT + '/tmp'
const logPath = serverRuntimeConfig.PROJECT_ROOT + '/logs'

export const NullAddress = '0x0000000000000000000000000000000000000000'

export const setlog = (msg: string | Error | null = null): void => {
	try {
		const date = new Date()
		const y: number = date.getUTCFullYear()
		const m: number = date.getUTCMonth() + 1
		const d: number = date.getUTCDate()
		const hh: number = date.getUTCHours()
		const mm: number = date.getUTCMinutes()
		const ss: number = date.getUTCSeconds()
		const datetext: string = [ y, ('0' + m).slice(-2), ('0' + d).slice(-2), ].join('-')
		const timetext: string = [ ('0' + hh).slice(-2), ('0' + mm).slice(-2), ('0' + ss).slice(-2), ].join(':')
		if (msg instanceof Error) msg = msg.stack || msg.message
		const bStart = 0
		const text = `[${timetext}] ${msg === null ? '' : msg + '\r\n'}`
		fs.appendFileSync(logPath + '/' + datetext + '.log', (bStart ? '\r\n\r\n\r\n' : '') + text)
		if (process.env.NODE_ENV !== 'production') console.log(text)
	} catch (err:any) {
		console.log(err)
	}
}

const initialize = async (): Promise<void> => {
	if (!MySQLModel.db) {
		console.log('connecting Database...')
		await MySQLModel.connect({
			host: process.env.DB_HOST,
			port: Number(process.env.DB_PORT),
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME,
		})
		global.lastCheckTime = 0
		global.users = {}
		let rows: any = await Users.find({ alias: { $ne: null } })
		if (rows) {
			for (const v of rows) {
				const user:User = {id: v.id, alias: v.alias || '', about: v.about || ''}
				global.users[v.id] = user
			}
		}
	}
}
async function sendRequest(params:any) {
    const request_url = process.env.GEETEST_BYPASS_URL;
    let bypass_res;
    try {
        const res = await axios({
            url: request_url,
            method: "GET",
            timeout: 5000,
            params: params
        });
        const resBody:any = (res.status === 200) ? res.data : "";
        console.log(resBody)
        bypass_res = resBody["status"];
    } catch (e) {
        bypass_res = "";
    }
    return bypass_res;
}


export const getGeetestByPass = async (): Promise<boolean> => {
	await initialize();
	const time = now();
	const row = await ConfigData.findOne('GEETEST_BYPASS')
	const lastUpdated = row.value ? Number(row.value) : 0;
	if (lastUpdated && time - lastUpdated < 10) return true;
	let bypass_status = await sendRequest({"gt":process.env.GEETEST_ID});
	if (bypass_status === "success") {
		await ConfigData.update('GEETEST_BYPASS', {value:time})
		return true
	}
	bypass_status = "fail"
	await ConfigData.update('GEETEST_BYPASS', {value:null})
	return false
}

const getRefId = (id: number, uid: number): string => {
	return JSBI.add( JSBI.multiply(JSBI.BigInt(id), e8), JSBI.BigInt(uid) ).toString(10)
}

const artwork = (v: any): Artwork => {
	let isVideo = false, isMusic = false
	const ext = v.file.slice(v.file.lastIndexOf('.') + 1)
	if (ext === 'mp3') {
		isMusic = true
	} else if (ext === 'mp4') {
		isVideo = true
	}
	const url = 'https://storage.googleapis.com/crossverse'
	const user = global.users[v.uid] || {}
	return {
		id: v.id,
		key: v.key,
		store: v.store,
		category: v.category,
		title: v.name,
		author: user ? '@' + user.alias : '-',
		aboutAuthor: user && user.about || '',
		description: v.description || '',
		worknumber: v.worknumber || 0,
		file: `${url}/${v.file}`,
		thumbnail: `${url}/${v.thumbnail}`,
		isVideo,
		isMusic,
		price: toEther(v.price),
		auction: v.auction === 1,
		auctiontime: v.auctiontime || 0,
		instock: v.instock || 0,
		totalsupply: v.totalsupply || 0,
		volume: (v.volume || 0) / 1e6,
		views: v.views || 0,
		likes: v.likes || 0,
		dislikes: v.dislikes || 0,
		drop: v.drop === 1,
		pinned: v.pinned === 1,
		created: v.created,
	}
}

const updateGlobalUser = (data: User): void => {
	global.users[data.id] = data
}

const deleteFromGCP = async (files: Array<string>): Promise<void> => {
	try {
		for (const file of files) {
			await bucket.file(file).delete()
		}
	} catch (err:any) {
		setlog(err)
	}
}

const uploadToGCP = (filename: string, buffer: any) => {
	return new Promise((resolve) => {
		try {
			console.log(filename, buffer.length)
			const blob = bucket.file(filename)
			const blobStream = blob.createWriteStream({ resumable: false })
			blobStream.on('error', (err) => resolve({ err: err.message }))
			blobStream.on('finish', () => resolve(`https://storage.googleapis.com/${bucket.name}/${blob.name}`))
			blobStream.end(buffer)
		} catch (err:any) {
			setlog(err)
			resolve({ err: `Could not upload the file: ${filename}. ${err}` })
		}
	})
}

const getArts = async (type: 'drop' | 'pinned' | 'all'): Promise<Array<Artwork>> => {
	const where:ModelWhere = {};
	if (type === 'all') {
		where.drop = 0
	} else if (type === 'drop') {
		where.drop = 1
	} else if (type === 'pinned') {
		where.drop = 0
		where.pinned = 1
	}
	const result: Array<Artwork> = []
	const rows = await Arts.find(where)
	if (rows) {
		for (const v of rows) {
			result.push(artwork(v))
		}
	}
	return result
}

export const validateAddress = (address: string) => web3.utils.isAddress(address)

export const getAvailableTokenId = async ():Promise<number> => {
	await initialize();
	let tokenid = await Arts.max('id')
	if (tokenid < 1e8) tokenid = 1e8
	tokenid += Math.round(Math.random() * 100)
	return tokenid + 1
}
export const getETHPrice = async (): Promise<number> => {
	try {
		const time = now()
		if (!global.eth) global.eth = { price: 0, updated: time }
		if (!global.eth.price || time - global.eth.updated > 60) {
			const result = await fetch( 'https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT' )
			const json = await result.json()
			global.eth.price = Number(json.price)
			global.eth.updated = time
		}
		return global.eth.price
	} catch (err:any) {
		setlog('api.binance.com did not response.')
	}
	return 0
}

export const toHex = (val: number): string => web3.utils.toHex(Math.round(val))

export const sign = async ( buyer: string, seller: string, tokenid: number, price: string, quantity: string, amount: string, timestamp: number ): Promise<string | null> => {
	try {
		const contract = new web3.eth.Contract( <any>abiStorefront, conf.storefront )
		const hash = await contract.methods.getMessageHash( buyer, seller, tokenid, price, quantity, amount, timestamp ).call()
		const { signature } = await web3.eth.accounts.sign(hash, privkey)
		return signature
	} catch (err:any) {
		setlog(err)
	}
	return null
}

const callBySigner = async ( to: string, abi: any, method: string, ...args: any[] ): Promise<string | null> => {
	try {
		const account = web3.eth.accounts.privateKeyToAccount(privkey)
		const contract = new web3.eth.Contract(abi, to, { from: account.address, })
		const data = contract.methods[method](...args).encodeABI()
		const gasPrice = await web3.eth.getGasPrice()
		const gasLimit = await contract.methods[method](...args).estimateGas()
		const json = { gasPrice, gasLimit, to, value: 0x0, data }
		const signedTx: any = await web3.eth.accounts.signTransaction( json, privkey )
		const receipt = await web3.eth.sendSignedTransaction( signedTx.rawTransaction )
		if (receipt && receipt.transactionHash) return receipt.transactionHash
	} catch (err:any) {
		setlog(err)
	}
	return null
}

export const updateTx = async ( uid: number, tx: Transaction ): Promise<boolean> => {
	try {
		const result = await Txs.insertOrUpdate({ uid, ...tx })
		return result !== null
	} catch (err:any) {
		setlog(err)
	}
	return false
}
export const updateOffer = async ( uid: number, offer: Offer ): Promise<boolean> => {
	try {
		await Offers.delete({ uid, tokenid: offer.tokenid, status: { $ne: 100 } })
		const result = await Offers.insert({ ...offer, price: fromEther(offer.price), amount: fromEther(offer.amount), uid })
		return result !== null
	} catch (err:any) {
		setlog(err)
	}
	return false
}
export const deleteOffer = async ( uid: number, tokenid:number ): Promise<boolean> => {
	try {
		const result = await Offers.delete({ uid, tokenid })
		return result !== null
	} catch (err:any) {
		setlog(err)
	}
	return false
}

export const checktxs = async (): Promise<boolean> => {
	try {
		await initialize()
		const rows = await Txs.find({ status: 0 })
		if (rows && rows.length) {
			const txs: {
				[k: number]: {
					txid: string
					from: string
					uid: number
					to: string
					created: number
				}
			} = {}
			const json = []
			let k = 0
			for (const v of rows) {
				txs[k] = {txid: v.txid, from: v.from, uid: v.uid, to: v.to, created: v.created}
				json.push({jsonrpc: '2.0', method: 'eth_getTransactionReceipt', params: [v.txid], id: k})
				k++
			}
			const results = await call(conf.rpc, json)
			if (results && results.length) {
				const current = await web3.eth.getBlock('latest')
				const updates: Array<{ txid: string; status: number }> = []
				const created = Number(current.timestamp)
				for (const json of results) {
					const tx = txs[json.id]
					const receipt = json.result
					if (receipt && receipt.blockNumber) {
						if (receipt.status === '0x1') {
							if ( current.number - receipt.blockNumber + 1 >= confirmations ) {
								if (tx.to === conf.storefront) {
									const events = parseLog( receipt.logs, abiStorefront )
									if (events) {
										for (const v of events) {
											if ( v.name === 'Buy' || v.name === 'Sell' ) {
												const gold = JSBI.BigInt( v.args.gold )
												const tokenid = JSBI.toNumber( JSBI.divide(gold, e8) )
												const quantity = JSBI.toNumber( JSBI.remainder(gold, e8) )
												const price = Math.round( Number(v.args.price) / 1e12 )
												const buyer = v.args.buyer
												const seller = v.args.seller === NullAddress ? null : v.args.seller
												const pid = v.args.pid
												await buy( tx.uid, tokenid, price, quantity, buyer, seller, pid, created )
											} else if ( v.name === 'TransferSingle' ) {
												const from = v.args.from
												const to = v.args.to
												const tokenid = v.args.id
												const quantity = Number( v.args.value )
												await transfer( from, to, tokenid, quantity, created )
											} else if ( v.name === 'ApprovalForAll' ) {
												const account = v.args.account
												const operator = v.args.operator
												const approved = v.args.approved
												if ( operator === conf.storefront ) {
													const row = await Nfts.findOne( { uid: tx.uid, buyer: account, status: 1 } )
													if (row) {
														await Nfts.update( row.id, { status: approved ? 100 : 0, listed: now() } )
													}
												}
											}
										}
									}
								} else if (tx.to === conf.weth.contract) {
									const events = parseLog( receipt.logs, abiWETH )
									if (events) {
										for (const v of events) {
											if (v.name === 'Approval') {
												await Offers.update(tx.txid, { status: 1 })
											}
										}
									}
								}
								updates.push({ txid: tx.txid, status: 100 })
							}
						} else {
							updates.push({ txid: tx.txid, status: 1 })
						}
					} else {
						if (created - tx.created > 86400) {
							updates.push({ txid: tx.txid, status: 1 })
						}
					}
				}
				if (updates.length) {
					await Txs.insertOrUpdate(updates)
				}
			}
		}
		return true
	} catch (err:any) {
		setlog(err)
	}
	return false
}

const buy = async ( uid: number, tokenid:number, price: number, quantity: number, buyer: string, seller: string, pid: string, created: number ): Promise<void> => {
	try {
		const row = await Arts.findOne(tokenid);
		if (row) {
			const art: Artwork = artwork(row)
			let sellerid = 0
			if (pid.length === 66) {
				const row = await Offers.findOne(pid)
				if (row.quantity > quantity) {
					await Offers.update(pid, {quantity: row.quantity - quantity, amount: (row.quantity - quantity) * row.price})
				} else {
					await Offers.update(pid, {quantity: 0, amount: 0, status: 100})
				}
				sellerid = uid
				uid = row.uid
				pid = '0'
			}
			if (seller === null) {
				if (art.instock > quantity) {
					art.instock -= quantity
				} else {
					art.instock = 0
				}
				await Arts.update(art.id, {instock:art.instock})
			} else {
				const row = await Nfts.findOne( pid === '0' ? { tokenid: art.id, uid: sellerid, buyer: seller } : Number(pid) )
				if (row) {
					sellerid = row.uid;
					const data: any = { updated: created }
					data.balance = row.balance - quantity
					if (data.balance <= 0) {
						data.balance = 0
						data.status = 0
						data.listed = 0
					}
	
					if (row.sellbalance) {
						data.sellbalance = row.sellbalance - quantity
						if (data.sellbalance <= 0) {
							data.sellprice = 0
							data.sellbalance = 0
							data.status = 0
							data.listed = 0
						}
					}
					await Nfts.update(row.id, data)
				}
			}
			const cur = await Nfts.findOne({ uid, buyer, tokenid: art.id })
			if (cur) {
				await Nfts.update(cur.id, { balance: cur.balance + quantity, price, updated: created })
			} else {
				await Nfts.insert({ tokenid: art.id, uid, price, balance: quantity, buyer, seller, created })
			}
			await Trades.insert({ uid, tokenid: art.id, event: 1, price, quantity, from: sellerid, to: uid, created })
			art.volume += (price * quantity) / 1e6
			await Arts.update(art.id, { volume: { $ad: price * quantity } })
		} else {
			setlog('undefined tokenid [' + tokenid + ']')	
		}
	} catch (err:any) {
		setlog(err)
	}
}

const transfer = async ( from: string, to: string, tokenid: number, quantity: number, created: number ): Promise<void> => {
	try {
		let senderid = 0, receiverid = 0, senderPrice = 0
		const sender = await Nfts.findOne({ tokenid, buyer: from })
		if (sender) {
			const data: any = { updated: created }
			const balance = sender.balance - quantity

			if (balance <= 0) {
				data.balance = 0
				data.status = 0
			} else {
				data.balance = balance
			}
			if (sender.sellbalance) {
				const sellbalance = sender.sellbalance - quantity
				if (sellbalance <= 0) {
					data.sellbalance = 0
					data.status = 0
				} else {
					data.sellbalance = sellbalance
				}
			}
			await Nfts.update(sender.id, data)
			senderid = sender.uid
			senderPrice = sender.price
		}
		const receiver = await Nfts.findOne({ tokenid, buyer: to })
		if (receiver) {
			await Nfts.update(receiver.id, { balance: receiver.balance + quantity, updated: created })
			receiverid = 0
		} else {
			const w = await Wallets.findOne(to)
			receiverid = w ? w.uid : 0
			await Nfts.insert({ tokenid, uid: receiverid, price: senderPrice, balance: quantity, buyer: to, seller: from, created })
		}
		await Trades.insert({ uid: senderid, tokenid, event: 2, price: senderPrice, quantity, from: senderid, to: receiverid, created })
	} catch (err:any) {
		setlog(err)
	}
}

export const getAssets = async (uid: number): Promise<Array<Artwork>> => {
	const result: Array<Artwork> = []
	try {
		await initialize()
		const address = ''
		if (address) {
			const contract = new web3.eth.Contract(<any>abiStorefront, conf.storefront)
			const res = await contract.methods.assetsByAccount(address).call()
			if (res) {
				const count = Number(res)
				const ids = []
				const tokens: { [tokenid: number]: number } = {}
				let start = 0
				while (start < count) {
					let end = start + 1000
					if (end >= count) end = count
					const assets = await contract.methods.assetsByAccount(address, start, end - 1).call()
					if (assets && Array.isArray(assets)) {
						for (const v of assets) {
							const tokenid = Number(v[0])
							const balance = Number(v[1])
							if (balance) {
								ids.push(tokenid)
								tokens[tokenid] = balance
							}
						}
					}
					start = end
				}
				if (ids.length) {
					let rows: any = await Nfts.find({ uid })
					const assets: {[id: number]: {id:number, balance: number}} = {}
					for (const v of rows) {
						assets[v.tokenid] = {id:v.id, balance:v.balance}
					}
					rows = await Arts.find({ id: ids })
					if (rows) {
						const inserts = []
						const updates = []
						for (const v of rows) {
							const art = artwork(v)
							const balance = tokens[art.id]
							if (assets[v.id] !== undefined) {
								if (assets[v.id].balance !== balance) {
									updates.push({id: assets[v.id].id, balance})
								}
							} else {
								inserts.push({uid, tokenid: art.id, seller: null, price: fromEther(art.price), balance, status: 0, created: now()})
							}
							result.push({ ...art, balance })
						}
						if (updates.length) {
							await Nfts.insertOrUpdate(updates)
						}
						if (inserts.length) {
							await Nfts.insert(inserts)
						}
					}
				}
			}
		}
	} catch (err:any) {
		setlog(err)
	}
	return result
}

export const sendReset = async (email: string, ip: string): Promise<any> => {
	try {
		await initialize()
		const time = now()
		const password = generatePassword()

		const row = await Authcodes.findOne({ email })
		if (row) {
			if (row.reset >= 3) return { status: 'err', msg: 'You have already failed +3 times.' }
			if (time - row.updated < 60) return { status: 'err', msg: `we can send a reset request email agian after ${60 - time + row.updated}s.` }
			await Authcodes.update(email, { ip, reset: { $ad: 1 }, updated: time })
			const user = await Users.findOne({email});
			if (user) {
				const emailname = user.alias
				const contents = Html_Reset.replace( /{{([^}]*)}}/g, (full: string, query: string) => {
					if (query === 'name') return emailname
					if (query === 'password') return password
					if (query === 'website') return 'http://18.191.78.153'
					if (query === 'domain') return 'crossverse'
					if (query === 'team') return 'CrossVerse Team'
					if (query === 'support') return 'support@crossverse.com'
					return full
				})
				const updated = now()
				await Userlog.insert({ uid:user.id, ip, created:updated })
				await Users.update(user.id, {passwd: hash(password), lastip: ip, updated})
				await sendEmail(email, 'Reset your password', contents)
				return { status: 'ok' }
			}
		}
		return { status: 'err', msg: `Unregistered email. Please use the email you used to register.` }
	} catch (err:any) {
		setlog(err)
	}
	return { status: 'err', msg: `unknown` }
}
export const sendCode = async (email: string, ip: string): Promise<any> => {
	try {
		await initialize()
		const time = now()
		const code = generateCode()

		const row = await Authcodes.findOne({ email })
		if (row) {
			if (row.count >= 3) return { status: 'err', msg: 'You have already failed 3 times. Please try again with a different email account.' }
			if (time - row.updated < 60) return { status: 'err', msg: `we can send a email code agian after ${60 - time + row.updated}s.` }
			await Authcodes.update(email, { code, ip, count: { $ad: 1 }, updated: time })
		} else {
			await Authcodes.insert({ email, code, ip, count: 1, updated: time })
		}
		const emailname = (email.match(/^.+(?=@)/) || [])[0]
		const contents = Html_Register.replace( /{{([^}]*)}}/g, (full: string, query: string) => {
			if (query === 'name') return emailname
			if (query === 'code') return code
			if (query === 'website') return 'http://18.191.78.153'
			if (query === 'domain') return 'crossverse'
			if (query === 'team') return 'CrossVerse Team'
			if (query === 'support') return 'support@crossverse.com'
			return full
		})
		await sendEmail(email, 'Verify your registration', contents)
		return { status: 'ok' }
	} catch (err:any) {
		setlog(err)
	}
	return { status: 'err', msg: `unknown` }
}

const sendEmail = async (to:string, subject:string, html:string) => {
	// await gmail.send(to, subject, html);
	 // send mail with defined transport object
	return await new Promise(resolve=>{
		const smtpTransport = nodemailer.createTransport({
			host: SMTPHOST,
			port: SMTPPORT,
			auth: {
				user: SMTPUSER,
				pass: SMTPPASS
			}
		});

		smtpTransport.sendMail({
			from: process.env.SMTP_USER,
			to,
			subject,
			html
		}, (error, info) => {
			if (error) {
				resolve(null)
				return console.log(error.message);
			}
			console.log('Message sent: %s', info.messageId);
			resolve(null)
		});
	})
}

export const login = async ( email: string, password: string, ip: string ): Promise<any> => {
	try {
		await initialize()
		const row: any = await Users.findOne({ email })
		if (row === null) return null
		const passwordHash = hash(password);
		if (row.passwd === passwordHash) {
			const time = now()
			await Users.update(row.id, { lastip: ip, lastlogged: time })
			await Userlog.insert({ uid: row.id, ip, created: time })
			return { name: row.alias || '', email, id: row.id }
		}
	} catch (err:any) {
		setlog(err)
	}
	return null
}

export const register = async ( alias:string, email:string, password: string, code: string, ip: string ): Promise<ApiResponse> => {
	try {
		await initialize()
		let row: any = await Authcodes.findOne({ email })
		if (row && row.email === email) {
			if (row.code === code) {
				row = await Users.findOne({ email })
				if (row === null) {
					const created = now()
					const uid = await Users.insert({ alias, email, passwd: hash(password), lastip: ip, created })
					updateGlobalUser({ id: uid, alias, about: '' })
					await Userlog.insert({ uid, ip, created })
					return { status: 'ok' }
				} else {
					return { status: 'err', msg: 'exists email' }
				}
			} else {
				return { status: 'err', msg: 'invalid verify code' }
			}
		} else {
			return { status: 'err', msg: 'first, you must send email verify code.' }
		}
	} catch (err:any) {
		setlog(err)
	}
	return { status: 'err', msg: `unknown` }
}

export const updateNewNFT = async ({ tokenid, store, author, worknumber, category, name, description, priceEth, balance, auction, auctiontime, physical, file, thumbnail }: CreateNFTParams): Promise<ApiResponse> => {
	try {
		await initialize()
		let row = await Users.findOne({alias:author})
		if (row) {
			const uid = row.id;
			row = await Arts.findOne(tokenid)
			const old = row ? artwork(row) : null
			const isUpdate = old !== null
			const created = now()
			const key = hash(String(tokenid))
			const price = fromEther(priceEth)

			const v: any = {
				id: tokenid,
				key,
				store,
				uid,
				worknumber,
				category,
				name,
				description,
				price,
				auction: auction ? 1 : 0,
				auctiontime,
				physical: physical ? 1 : 0,
			}
			if (file) {
				if (old && old.file) await deleteFromGCP([ old.file.slice(old.file.lastIndexOf('/') + 1) ])
				const ext = file.ext
				const filename = tokenid + '-' + now() + '.' + ext
				const resUpload: any = await uploadToGCP( filename, fs.readFileSync(temp + '/upload_' + file.fileid) )
				if (!resUpload || (resUpload && resUpload.err)) return { status: 'err', msg: `Google cloud upload error` }
				v.file = filename
			}
			const thumbnailfile = file && thumbnail === null ? file : thumbnail
			if (thumbnailfile) {
				if (old && old.thumbnail) await deleteFromGCP([ old.thumbnail.slice(old.thumbnail.lastIndexOf('/') + 1) ])
				const filename = tokenid + '-thumbnail-' + now() + '.webp'
				const orgfile = temp + '/upload_' + thumbnailfile.fileid
				const tempfile = temp + '/tmp_' + thumbnailfile.fileid + '.webp'
				try {
					const dims: any = sizeOf(orgfile)
					let w = dims.width, h = dims.height
					const rx = dims.width / 400
					const ry = dims.height / 400
					if (rx > 1 || ry > 1) {
						if (rx > ry) {
							w = 400
							h = Math.round(h / rx)
						} else {
							w = Math.round(w / ry)
							h = 400
						}
					}
					await sharp(orgfile).resize(w, h).toFile(tempfile)
					const resUpload: any = await uploadToGCP( filename, fs.readFileSync(tempfile) )
					if (!resUpload || (resUpload && resUpload.err)) {
						return { status: 'err', msg: `Google cloud upload error`}
					}
					v.thumbnail = filename
				} catch (err:any) {
					return { status: 'err', msg: err.message }
				}
			}
			fsExtra.emptyDirSync(temp)
			if (!isUpdate) {
				v.totalsupply = balance;
				v.instock = balance;
				v.drop = 1;
				v.status = 100
				v.created = created
			}
			if (auction) {
				v.totalsupply = 1
				v.instock = 1
			}
			await Arts.insertOrUpdate(v)
			if (!isUpdate) {
				await Trades.insert({uid, tokenid, event: 0, price, quantity: balance, from: uid, to: 0, created})
			}
			return {status: 'ok'}
		} else {
			return {status: 'err', msg: 'unknown artist'}
		}
	} catch (err:any) {
		return {status: 'err', msg: err.message}
	}
}
export const updateArtSupply = async ( tokenid: number, quantity: number ): Promise<ApiResponse> => {
	try {
		await initialize()
		await Arts.update(tokenid, { totalsupply:{$ad:quantity}, instock: {$ad:quantity}})
		return {status: 'ok'}
	} catch (err:any) {
		setlog(err)
	}
	return {status: 'err'}
}

export const updateCampaign = async ({ title, subtitle, lasttime, file }: CampaignParams): Promise<ApiResponse> => {
	try {
		await initialize()
		const data: any = {id: 1, title, subtitle, lasttime}
		if (file) {
			const row = await Campaigns.findOne(1)
			if (row && row.banner) await deleteFromGCP([row.banner.slice(row.banner.lastIndexOf('/') + 1)])
			const filename = 'campaign-' + new Date().getTime() + '.webp'
			const tempfile = temp + '/upload_' + file.fileid
			const tempfile2 = temp + '/upload_' + filename
			try {
				const dims: any = sizeOf(tempfile)
				let w = dims.width, h = dims.height
				const rx = dims.width / 1600
				const ry = dims.height / 625
				if (rx > 1 || ry > 1) {
					if (rx > ry) {
						w = 1600
						h = Math.round(h / rx)
					} else {
						w = Math.round(w / ry)
						h = 625
					}
				}
				await sharp(tempfile).resize(w, h).toFile(tempfile2)
				const resUpload: any = await uploadToGCP(filename, fs.readFileSync(tempfile2))
				if (!resUpload || (resUpload && resUpload.err)) {
					setlog(resUpload ? resUpload.err : `Google cloud unknown error` )
					return { status: 'err', msg: `Google cloud upload error` }
				}
				data.banner = resUpload
			} catch (e:any) {
				setlog(e)
			}
			fsExtra.emptyDirSync(temp)
		}
		await Campaigns.insertOrUpdate(data)
		await Arts.update({drop:1, auction:1}, {auctiontime:lasttime})
		return { status: 'ok' }
	} catch (err:any) {
		setlog(err)
	}
	return { status: 'err', msg: `unknown` }
}

export const getArt = async (id: number): Promise<Artwork | null> => {
	await initialize()
	const v = await Arts.findOne(id);
	return v ? artwork(v) : null
}

export const getArtHolderCount = async (id: number): Promise<number> => {
	try {
		const art = await getArt(id)
		if (art) {
			return await Nfts.count('DISTINCTROW `uid`', {tokenid: id, balance: { $ne: 0 }})
		}
	} catch (err:any) {
		setlog(err)
	}
	return 0
}

export const setArtViews = async (uid: number, id: number): Promise<void> => {
	try {
		const art = await getArt(id)
		if (art) {
			art.views++
			await Arts.update(id, { views: art.views })
			await Artviews.insertOrUpdate({ id: getRefId(id, uid), uid })
		}
	} catch (err:any) {
		setlog(err)
	}
}

export const getArtLiked = async ( uid: number, id: number ): Promise<number> => {
	try {
		const art = await getArt(id)
		if (art) {
			const row = await Artlikes.findOne(getRefId(id, uid))
			return row===null ? 0 : row.like
		}
	} catch (err:any) {
		setlog(err)
	}
	return 0
}

export const setArtLiked = async ( uid: number, id: number, like:number ): Promise<{likes:number,dislikes:number}|number> => {
	try {
		const art = await getArt(id)
		if (art) {
			const refid = getRefId(id, uid)
			const row = await Artlikes.findOne(refid)
			if (row === null) {
				const result = await Artlikes.insert({ id: refid, uid, like })
				if (result) {
					if (like===1) {
						art.likes++
						await Arts.update(id, { likes: art.likes })
					} else {
						art.dislikes++
						await Arts.update(id, { dislikes: art.dislikes })
					}
					return {likes:art.likes,dislikes:art.dislikes}
				}
			} else {
				return row.like
			}
		}
	} catch (err:any) {
		setlog(err)
	}
	return 0
}

export const getMyTokens = async (uid: number, id: number): Promise<number> => {
	try {
		const art = await getArt(id)
		if (art) {
			const where: any = { uid }
			if (id !== 0) where.tokenid = id
			return await Nfts.sum('balance', where)
		}
	} catch (err:any) {
		setlog(err)
	}
	return 0
}

export const getOfferById = async ( txid: string ): Promise<OfferWithArt | null> => {
	try {
		await initialize()
		const {users} = global
		const v: any = await Offers.findOne(txid)
		if (v) {
			const user = users[v.uid]
			const row = await Arts.findOne(v.tokenid)
			if (user && row) {
				return {
					tokenid: v.tokenid,
					ownerid:v.uid,
					txid,
					from: user.alias,
					buyer: v.buyer,
					price: toEther(v.price),
					quantity: v.quantity,
					amount: toEther(v.amount),
					status: v.status,
					created: v.created,
				}
			}
		}
	} catch (err:any) {
		setlog(err)
	}
	return null
}

const getOffers = async (uid: number, where: string | ModelWhere, limit: number): Promise<Array<OfferWithArt>> => {
	const result: Array<OfferWithArt> = []
	try {
		await initialize()
		const { users } = global
		const rows: any = await Offers.find(where, { created: -1 }, null, {limit})
		if (rows) {
			for (const v of rows) {
				const user = users[v.uid]
				if (user) {
					result.push({
						tokenid: v.tokenid,
						ownerid:v.uid,
						txid: v.txid,
						from: user.alias,
						buyer: v.buyer,
						price: toEther(v.price),
						quantity: v.quantity,
						amount: toEther(v.amount),
						status: v.status,
						created: v.created,
						mine: v.uid === uid
					})
				}
			}
		}
	} catch (err:any) {
		setlog(err)
	}
	return result
}

export const getOffersByTokenId = async ( tokenid: number, uid: number ): Promise<Array<OfferWithArt>> => {
	return await getOffers(uid, { tokenid, won:0, status: 1 }, 100)
}

export const getOffersByUID = async ( uid: number ): Promise<Array<OfferWithArt>> => {
	return await getOffers(uid, { uid, won:0 }, 100)
}
export const getOffersWons = async ( uid: number ): Promise<Array<OfferWithArt>> => {
	return await getOffers(uid, { uid, won:1 }, 100)
}

export const getTradeHistory = async (tokenid: number): Promise<Array<Trade>> => {
	const result: Array<Trade> = []
	try {
		await initialize()
		const { users } = global
		const rows: any = await Trades.find({ tokenid }, { created: -1 })
		if (rows) {
			for (const v of rows) {
				result.push({
					event: v.event,
					price: toEther(v.price),
					quantity: v.quantity,
					from: v.from && users[v.from] ? users[v.from].alias : null,
					to: v.to && users[v.to] ? users[v.to].alias : null,
					created: v.created,
				})
			}
		}
	} catch (err:any) {
		setlog(err)
	}
	return result
}

export const getCampaign = async (): Promise<Campaigns> => {
	try {
		await initialize()
		const v = await Campaigns.findOne({}, { id: -1 })
		if (v) {
			return {title: v.title || '', subtitle: v.subtitle || '', banner: v.banner || '', lasttime: v.lasttime || ''}
		}
	} catch (err:any) {
		setlog(err)
	}
	return {title: '',subtitle: '',banner: '',lasttime: 0}
}

export const getDrops = async (): Promise<Array<Artwork>> => {
	try {
		await initialize()
		return await getArts('drop')
	} catch (err:any) {
		setlog(err)
	}
	return []
}
export const getRecommended = async (): Promise<Array<Artwork>> => {
	try {
		await initialize()
		return await getArts('pinned')
	} catch (err:any) {
		setlog(err)
	}
	return []
}

export const getNftList = async (): Promise<Array<Artwork>> => {
	try {
		await initialize()
		return await getArts('all')
	} catch (err:any) {
		setlog(err)
	}
	return []
}

export const getNftById = async (id: number): Promise<Artwork | null> => {
	try {
		await initialize()
		const { users } = global
		const v = await Nfts.findOne(id)
		if (v) {
			const row = await Arts.findOne(v.tokenid);
			if (row) {
				const art = artwork(row)
				return {...art, ownerid: v.uid, owner: users[v.uid].alias, ownerAddress: v.buyer, price: toEther(v.price), sellPrice: toEther(v.sellprice), balance: v.balance, sellBalance: v.sellbalance}
			}
		}
	} catch (err:any) {
		setlog(err)
	}
	return null
}

const getNfts = async (where: string | ModelWhere, limit: number, uid?: number): Promise<Array<Artwork>> => {
	const result: Array<Artwork> = []
	try {
		await initialize()
		const { users } = global
		
		const rows = await (typeof where === 'string' ? MySQLModel.exec(where) : Nfts.find( { ...where, balance: { $ne: 0 } }, { created: -1 }, null, { limit }))
		if (rows) {
			let ps:any = {};
			for (let row of rows) {
				ps[row.tokenid] = 1;
			}
			let keys:any = Object.keys(ps)
			const tmp = await Arts.find({id:keys})
			const arts:{[id:number]:Artwork} = {}
			if (tmp) {
				for(let v of tmp) {
					arts[v.id] = artwork(v)
				}
			}
			
			for (const row of rows) {
				const v = arts[row.tokenid]
				if (v) {
					const val = {...v, owner: (users && users[row.uid] && users[row.uid].alias) || '', ownerAddress: row.buyer, ownerid: row.id, price: toEther(row.price), balance: row.balance || 0, }
					if (row.status === 100) {
						val.sellPrice = toEther(row.sellprice)
						val.sellBalance = row.sellbalance || 0
						val.listed = row.listed
					}
					if (uid) val.mine = row.uid === uid
					result.push(val)
				}
			}
		}
	} catch (err:any) {
		setlog(err)
	}
	return result
}

export const getListings = async (tokenid: number,uid: number): Promise<Array<Artwork>> => {
	return await getNfts({ tokenid, status: 100, sellbalance: { $ne: 0 } }, 100, uid)
}

export const addlist = async (tokenid: number, uid: number, address: string, price: number, quantity: number): Promise<boolean> => {
	try {
		const result = await Nfts.update({uid, tokenid, buyer: address, balance: {$gt: quantity - 1}}, {status: 1, sellprice: fromEther(price), sellbalance: quantity})
		return result !== null
	} catch (err:any) {
		setlog(err)
	}
	return false
}

export const delist = async (uid: number): Promise<boolean> => {
	try {
		const result = await Nfts.update({uid}, {status:0, sellprice:0, sellbalance:0, listed:0})
		return result !== null
	} catch (err:any) {
		setlog(err)
	}
	return false
}

export const getSales = async (): Promise<Array<Artwork>> => {
	return await getNfts({ seller: null }, 20)
}

export const getResales = async (): Promise<Array<Artwork>> => {
	return await getNfts({ seller: { $ne: null } }, 20)
}

export const getPurchased = async (uid: number, limit?: number): Promise<Array<Artwork>> => {
	return await getNfts({ uid }, limit || 100)
}

export const getLikes = async (uid: number): Promise<Array<Artwork>> => {
	return await getNfts(`SELECT * FROM (SELECT * FROM nfts WHERE uid='${uid}' AND balance!=0) a INNER JOIN  (SELECT (id - uid)/1e8 as tokenid FROM artlikes WHERE uid='${uid}') b USING (tokenid)`, 20)
}

export const getTxs = async (uid: number): Promise<Array<Transaction>> => {
	const result: Array<Transaction> = []
	try {
		await initialize()
		const rows = await Txs.find({ uid }, { created: -1 }, null, {limit: 20})
		if (rows) {
			for (const v of rows) {
				result.push({txid: v.txid, from: v.from, to: v.to, status: v.status, created: v.created})
			}
		}
	} catch (err:any) {
		setlog(err)
	}
	return result
}

export const getAccount = async (uid: number): Promise<Account | null> => {
	try {
		await initialize()
		const user = await Users.findOne(uid)
		if (user) {
			const wallets = await Wallets.find({ uid })
			return {email: user.email, alias: user.alias, subscribe: user.subscribe === 1, twitter: user.twitter, facebook: user.facebook, about: user.about, wallets: wallets ? wallets.map((v: any) => v.key) : []}
		}
	} catch (err:any) {
		setlog(err)
	}
	return null
}

export const setAccount = async ( uid: number, alias: string, about: string, subscribe: boolean, twitter: string | null, facebook: string | null): Promise<boolean> => {
	try {
		await initialize()
		if (global.users[uid]) {
			await Users.update(uid, {alias, about, subscribe: subscribe ? 1 : 0, twitter, facebook, updated: now()})
			updateGlobalUser({ ...global.users[uid], alias, about })
			return true
		}
	} catch (err:any) {
		setlog(err)
	}
	return false
}

export const setPassword = async (uid: number, oldpass: string, newpass: string): Promise<boolean> => {
	try {
		await initialize()
		if (global.users[uid]) {
			const row = await Users.findOne(uid)
			if (row && row.passwd === hash(oldpass)) {
				await Users.update(uid, {passwd: hash(newpass), updated: now()})
				return true
			}
		}
	} catch (err:any) {
		setlog(err)
	}
	return false
}

export const setMyWallet = async ( uid: number, address: string ): Promise<string | null> => {
	try {
		await initialize()
		const isValid = web3.utils.isAddress(address)
		const { users } = global

		if (!isValid) return '❌ invalid address format'
		if (!users[uid]) return '❌ unregistered user'
		const row = await Wallets.findOne(address)
		
		if (row) {
			if (row.uid===uid) return null
			return `🦊 [${ address.slice(0, 6) + '...' + address.slice(-4) }] already in use by someone`
		}
		await Wallets.insert({ key: address, uid })
		return null
	} catch (err:any) {
		return err.message
	}
}

export const wonInAuction = async (tokenid:number): Promise<void> => {
	try {
		await initialize()
		const created = now()
		const won = await Offers.findOne({tokenid}, {price: -1})
		if (won) {
			const txid = await callBySigner( conf.storefront, abiStorefront, 'setAuctionWinner', tokenid, toHex(won.price * 1e12), won.quantity, toHex(won.price * won.quantity * 1e12), won.buyer )
			if (txid) await Txs.insert({ txid, uid: won.uid, from: signer, to: conf.storefront, status: 0, created })
			await Offers.update(won.id, {status:100, won:1})
			await Arts.update(tokenid, {auction:0, price:won.price, totalsupply:1, auctiontime:0})
		} else {
			await Arts.update(tokenid, {auction:0, price:won.price, totalsupply:0, auctiontime:0})
		}
		await Arts.update(tokenid, {auction:0, price:won.price, auctiontime:0})
	} catch (err:any) {
		setlog(err)
	}
}

export const checkArts = async (): Promise<void> => {
	try {
		await initialize()
		const created = now()
		const campaign = await getCampaign();
		if (campaign && campaign.lasttime<created) {
			let rows = await Arts.find({drop: 1})
			if (rows) {
				const updates = []
				let isAuction = false;
				for (const v of rows) {
					const art = artwork(v)
					if (v.auction) {
						await wonInAuction(v.id)
						isAuction = true
					} else {
						updates.push({id:v.id, totalsupply:art.totalsupply - art.instock, instock:0, drop:0})
					}
				}
				if (updates.length) await Arts.insertOrUpdate(updates)
				if (isAuction) await checktxs()
			}
		}
	} catch (err:any) {
		setlog(err)
	}
}

export const admin_get_arts = async (): Promise<AdminArts> => {
	const result: AdminArts = {}
	try {
		await initialize()
		const rows = await Arts.find()
		if (rows) {
			const { users } = global
			for (const v of rows) {
				result[v.id] = {
					key: v.key,
					store: v.store,
					uid: v.uid,
					author: (users[v.uid] && users[v.uid].alias) || '-',
					worknumber: v.worknumber,
					category: v.category,
					name: v.name,
					description: v.description,
					physical: v.physical,
					price: toEther(v.price),
					auction: v.auction,
					auctiontime: v.auctiontime,
					totalsupply: v.totalsupply,
					instock: v.instock,
					volume: v.volume,
					drop: v.drop,
					pinned: v.pinned,
					created: v.created,
				}
			}
		}
	} catch (err:any) {
		setlog(err)
	}
	return result
}

export const admin_set_arts = async (data: AdminArtValue): Promise<void> => {
	try {
		await initialize()
		await Arts.insertOrUpdate({ id: data.id, [data.field]: data.value })
	} catch (err:any) {
		setlog(err)
	}
}

