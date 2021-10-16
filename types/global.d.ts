declare namespace NodeJS  {
	interface Global {
		inited:boolean
		users: {
			[id:number]:User
		}
		eth: {
			price:number
			updated:number
		}
		lastCheckTime:number
	}
}
declare interface ReducerState {
	connected: boolean
	connecting: boolean
	checkingBalance: boolean
	address: string
	ETH: number
	WETH: number
	balance: number
	err:string
}



declare interface Window  {
	ethereum: any
	Web3: any
	initGeetest: any
}

declare interface ApiResponse {
	status:string
	msg?:string|any
}

declare interface PageBase {
	isDesktop?: boolean
	isMobile?: boolean
}

declare interface User {
	id:number
	alias:string
	about:string
}

declare interface CreateNFTParams {
	tokenid:number
	store:string
	author:string
	worknumber:number
	category:number
	name:string
	description:string
	priceEth:number
	totalsupply:number
    instock:number
	auction:boolean
	auctiontime:number,
	balance:number
	physical:boolean
	file:{
		ext:string, 
		fileid:string
	}
	thumbnail:{
		ext:string, 
		fileid:string
	}|null
}

declare interface CampaignParams {
	title:string,
	subtitle:string,
	lasttime:number,
	file:{
		ext:string, 
		fileid:string
	}
}

declare interface Campaigns {
	title: string
	subtitle: string
	banner: string
	lasttime: number
}

declare interface Artwork {
	id: number
	key: string
	store: string
	category: number
	title: v.name
	author: string
	aboutAuthor: string
	description: string
	worknumber: number
	thumbnail: string
	file: string
	isVideo: boolean
	isMusic: boolean
	instock: number
    totalsupply: number
	price: number
	auction: boolean
	auctiontime: number
	volume: number
	views: number
	likes: number
	dislikes: number
	drop: boolean
	pinned: boolean
	created: number
	
	owner?:string
	ownerid?: number
	ownerAddress?:string
	balance?: number
	sellPrice?: number
	sellBalance?: number
	mine?:boolean
	listed?:number
}

declare interface Price {
	date?: string
	price?: number
}

declare interface Trade {
	event: number
	price: number
	quantity: number
	from: string|null
	to: string|null
	created: number
}
declare interface Offer {
	txid: string
	from?: string
	tokenid: number
	price: number
	quantity: number
	amount: number
	status: number
	created:number
}
declare interface OfferWithArt {
	ownerid: number
	txid: string
	tokenid: number
	from: string
	buyer: string
	price: number
	quantity: number
	amount: number
	status: number
	created:number
	mine?:boolean
}
declare interface Transaction {
	txid: string
	from: string
	to: string
	status: number
	created: number
}

declare interface Account {
	email: string
	alias: string
	subscribe: boolean
	twitter: string
	facebook: string
	about: string
	wallets:Array<string>
}

declare interface ComponentBase {
	className?: string
}

interface CONFIG {
	[chainid: number]: NETWORKCONFIG
}
  
interface NETWORKCONFIG {
	title: string
	rpc: string
	explorer: string
	blocktime: number
	confirmations:number
	storefront: string
	weth: {
		contract: string
		precision: number
	}
}

declare type SendTxResult = {
	success:boolean
	tx?: Transaction
	errmsg?: string
}