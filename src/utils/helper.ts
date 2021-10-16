import * as crypto from 'crypto'
import dayjs from 'dayjs'
import { toast } from 'react-toastify';

export const copyToClipboard = (text:string) => {
	var textField = document.createElement('textarea')
	textField.innerText = text
	document.body.appendChild(textField)
	textField.select()
	document.execCommand('copy')
	textField.remove()
	toast(`Copied 【${text}】`, {
		position: "top-right",
		autoClose: 1000
	});
};
export const showTips = (text:string) => {
	toast(text, {
		position: "top-right",
		autoClose: 2000,
		/* hideProgressBar: false, */
		/* closeOnClick: true,
		pauseOnHover: true, */
		/* draggable: true, */
		/* progress: undefined, */
	});
};

export const getQueryVariable = (name:string) =>{
	const search = window.location.search;
	const params = new URLSearchParams(search);
	return params.get(name);
}
export const getDomain = () =>window.location.origin;

export const hash = (message: string): string => {
	const buf = new TextEncoder().encode(message)
	return crypto.createHash('sha256').update(Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength)).digest().toString('hex')
}

export const validURL = (url:string) => (!!new RegExp('^(https?:\\/\\/)?'+ // protocol
	'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
	'((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
	'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
	'(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
	'(\\#[-a-z\\d_]*)?$','i').test(url));
  

export const now = (): number => Math.round(Date.now() / 1000)
export const offsetDate: any = (time: number, offset: number) => dayjs(time * 1000 + (offset || 0) * 3600000).from(dayjs())
export const formatTime = (time: number, offset = 8): string => {
	const iOffset = Number(offset)
	const date = time === undefined ? new Date(Date.now() * 1000 + 3600000 * iOffset) : typeof time === 'number' ? new Date(time * 1000 + 3600000 * iOffset) : new Date(+time + 3600000 * iOffset)
	const y = date.getUTCFullYear()
	const m = date.getUTCMonth() + 1
	const d = date.getUTCDate()
	const hh = date.getUTCHours()
	const mm = date.getUTCMinutes()
	const ss = date.getUTCSeconds()
	const dt = ('0' + m).slice(-2) + '-' + ('0' + d).slice(-2)
	const tt = ('0' + hh).slice(-2) + ':' + ('0' + mm).slice(-2) + ':' + ('0' + ss).slice(-2)
	return y + '-' + dt + ' ' + tt
}

export const getLocalTime = (time?:number):string => (new Date(((time || now()) - new Date().getTimezoneOffset() * 60) * 1000).toISOString().slice(0,16))
export const fromLocalTime = (time:string):number => (Math.round(new Date(time).getTime() / 1000))

export const request = async (url: string): Promise<any> => {
	const res = await fetch(url, {
		mode: 'cors',
		cache: 'no-cache',
		credentials: 'same-origin',
		headers: {'Content-Type': 'application/json'},
		redirect: 'follow', 
		referrerPolicy: 'no-referrer'
	})
	return await res.json()
}

export const call = async (url: string, json: any): Promise<any> => {
	const res = await fetch(url, {
		method: 'POST',
		mode: 'cors',
		cache: 'no-cache',
		credentials: 'same-origin',
		headers: {'Content-Type': 'application/json'},
		redirect: 'follow', 
		referrerPolicy: 'no-referrer', 
		body: JSON.stringify(json)
	})
	return await res.json()
}

export const generateCode = (): string => {
	let code = '' + Math.round(Math.random() * 999999 + 1013)
	if (code.length < 6) code = '0'.repeat(6 - code.length) + code
	return code
}

export const generatePassword = (): string => Math.random().toString(36).slice(2)
export const toEther = (value: number): number => value / 1e6
export const fromEther = (value: number): number => Math.round(value * 1e6)

export function getViewURL(id?: number | string): string {
	return `/artwork/view/${id}`
}
