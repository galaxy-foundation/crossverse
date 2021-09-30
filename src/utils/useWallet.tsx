import React from 'react'
import { useSelector, useDispatch} from 'react-redux';
import JSBI from 'jsbi';
import abiStorefront from '@/config/abi/storefront.json'
import abiWETH from '@/config/abi/weth.json'
import Config from '@/config/v1.json'
import {call} from './helper'
import reducer, {getConnected} from '@/store/reducer'
import Web3 from 'web3'

const chainId = Number(process.env.NEXT_PUBLIC_CHAINID || 1);
const conf = (Config as CONFIG)[chainId]
const web3 = new Web3(conf.rpc)

export const confirmations = conf.confirmations
export const explorer = (type: 'address' | 'tx', arg: string): string => conf.explorer + '/' + type + '/' + arg
export const toHex = (val: number): string => web3.utils.toHex(Math.round(val))

interface UseWalletTypes {
    connecting: boolean
    connected: boolean
	address: string
	checkingBalance: boolean
    ETH: number
    WETH: number
	balance: number
    err:string
    connect: () => void
    callMethod: ( to: string, abi: any, method: string, args: Array<string|number|boolean> ) => Promise<any>
    send: ( from: string, to: string, value: string, abi: any, method: string, args: Array<string|number|boolean>) => Promise<SendTxResult>
    waitTransaction: ( txnHash: string, blocksToWait: number, cb?: (confirmations: number) => void ) => Promise<any>
    getEthers: (account: string, withoutState?: boolean) => Promise<{ETH:number,WETH:number}|null>
    getBalance:(account: string, tokenid: number) => Promise<number | null>
	approval: () => Promise<number>
    approve: (amount:number) => Promise<SendTxResult>
    approveContract: () => Promise<SendTxResult>
    buy: (params: any, value:number) => Promise<SendTxResult>
    sell: (params: any) => Promise<SendTxResult>
    transfer: (params: any) => Promise<SendTxResult>
}

export const validAddress = (address: string): boolean => {
    return web3.utils.isAddress(address)
}

const useWallet = (checkBalance:boolean, tokenid?:number):UseWalletTypes => {
	const wallet = useSelector((state:ReducerState)=>state)
	const dispatch = useDispatch()

	React.useEffect(() => {
		const { ethereum } = window
		if (ethereum) {
			ethereum.on('accountsChanged', accountChanged)
			ethereum.on('chainChanged', chainChanged)
			if (getConnected()) {
				if (ethereum.isConnected) {
					_connect();
				}
			}
		}
	}, [checkBalance])

	const update = (payload:any) => dispatch(reducer.actions.update(payload))

	const _connect = async (accounts?:Array<string>)=>{
		let err = '';
        const { ethereum } = window
		update({connecting:true})
		if (ethereum) {
			try {
				let address = '';
				if (!accounts) {
					accounts = await ethereum.request({method: 'eth_requestAccounts'})
					if (accounts && accounts.length) {
						address = accounts[0];
					} else {
						err = '🦊 No selected address.'
					}
				}
				if (!err) {
					const result = await call('/api/my/wallet', {address});
					if (result.status==='ok') {
						const _chainid = Number(await ethereum.request({ method: 'eth_chainId' }))
						const connected = chainId===_chainid;
						if (connected) {
							update({connected:false, connecting:true, checkingBalance:true, address:'', ETH:0, WETH:0, balance:0, err})
							if (tokenid) {
								const balance = await getBalance(address, tokenid);
								if (balance!==null) {
									return update({balance, connected:true, connecting:false, checkingBalance:false, address, err:''})
								}
							} else {
								const balances = await getEthers(address);
								if (balances) {
									return update({...balances, connected:true, connecting:false, checkingBalance:false, address, err:''})
								}
							}
							err = '❌ please check network connection'
						} else {
							err = '🦊 invalid chain id (' + _chainid + ')'
						}
					} else {
						err = result.msg
					}
				}
			} catch (err:any) {
                err = '🦊 ' + err.message
			}
		} else {
            err = '🦊 You must install Metamask into your browser: https://metamask.io/download.html'
        }
		update({connected:false, connecting:false, checkingBalance:false, address:'', ETH:0, WETH:0, balance:0, err})
    }
    
	const accountChanged = async (accounts: any) => {
		if (getConnected()) {
			_connect(accounts);
		}
	}
	const chainChanged = async () => {
		if (getConnected()) {
			_connect();
		}
	}

    const connect = async ()=>{
		_connect();
    }
    
	const callMethod = async ( to: string, abi: any, method: string, args: Array<string|number|boolean> ): Promise<any> => {
		try {
			const contract = new web3.eth.Contract(abi, to)
			const res = await contract.methods[method](...args).call()
			return res
		} catch (err:any) {
			console.log(err)
		}
		return null
	}
    const send = async ( from: string, to: string, value: string, abi: any, method: string, args: Array<string|number|boolean> ): Promise<SendTxResult> => {
		try {
			update({err:''})
			const { ethereum } = window
			if (ethereum && ethereum.isConnected) {
				const web3 = new Web3(ethereum)
				const contract = new web3.eth.Contract(abi, to)
				const data = contract.methods[method](...args).encodeABI()
				const json = { from, to, value, data }
				const res = await ethereum.request({ method: 'eth_sendTransaction', params: [json], })
				if (res) return { success: true, tx: { txid: res, from, to, status: 0, created: Math.round(Date.now()/1000) } }
                update({err:'🦊 unknown error'})
			} else {
                update({err:'🦊 Connect to Metamask using the button on the top right.'})
			}
		} catch (err:any) {
			let errmsg
			if (err.code === 4001) {
				errmsg = '🦊 You cancelled.'
			} else {
				errmsg = '🦊 ' + err.message
			}
            update({err:errmsg})
			return { success: false, errmsg }
		}
        return { success: false }
	}

    const waitTransaction = async ( txnHash: string, blocksToWait: number, cb?: (confirmations: number) => void ): Promise<any> => {
		try {
			let height = 0
			let repeat = 100
			while (--repeat > 0) {
				const time = +new Date()
				const receipt = await web3.eth.getTransactionReceipt(txnHash)
				if (receipt) {
					const resolvedReceipt = await receipt
					if (resolvedReceipt && resolvedReceipt.blockNumber) {
						const block = await web3.eth.getBlock(resolvedReceipt.blockNumber)
						const current = await web3.eth.getBlock('latest')
						if (height === 0) {
							height = current.number
						}
						if (current.number - block.number + 1 >= blocksToWait) {
							const txn = await web3.eth.getTransaction(txnHash)
							if (txn.blockNumber != null)
								return Number(resolvedReceipt.status) === 1
						} else {
							if (cb) {
								cb(current.number - height + 1)
							}
						}
					}
				}
				let delay = conf.blocktime - (+new Date() - time)
				if (delay < 1000) delay = 1000
				await new Promise((resolve) => setTimeout(resolve, delay))
			}
		} catch (err:any) {
			update({err:err.message})
		}
	}
    const getEthers = async (account: string, withoutState?:boolean): Promise<{ETH:number,WETH:number}|null> => {
        try {
			if (!withoutState) update({checkingBalance:true})
            if (withoutState || validAddress(account)) {
                const json = [
                    {"jsonrpc":"2.0","method":"eth_getBalance","params": [account, "latest"],"id":1},
                    {"jsonrpc":"2.0","method":"eth_call","params":[{"to": conf.weth.contract, "data":"0x70a08231000000000000000000000000"+account.slice(2)}, "latest"],"id":2}
                ];
                const results = await call(conf.rpc, json);
                if (results && results.length) {
					let ETH = 0, WETH = 0;
                    for(let json of results) {
						if (json.id===1) {
							ETH = Number(json.result) / 1e18;
						} else if (json.id===2) {
							WETH = Number(json.result) / 10 ** conf.weth.precision;
						}
					}
					if (!withoutState) update({checkingBalance:false})
					return { ETH, WETH }
				}
            } else {
                if (!withoutState) update({checkingBalance:false, err:'invalid address format'})
            }
		} catch (err:any) {
			if (!withoutState) update({checkingBalance:false, err:err.message})
		}
		return null
    }
	const getBalance = async(account: string, tokenid: number): Promise<number | null> => {
		let err = '';
        try {
			update({checkingBalance:true})
            if (validAddress(account)) {
                const res = await callMethod(conf.storefront, abiStorefront, 'balanceOf', [account, tokenid])
                if (res) {
                    return Number(res)
                } else {
					err = '❌ check network connection'
                }
            } else {
				err = '❌ invalid address format'
            }
		} catch (err:any) {
			err = '❌ ' + err.message
		}
		update({checkingBalance:false, err})
		return null
	}
	const approval = async (): Promise<number> => {
		try {
            if (wallet.address) {
                const res = await callMethod(conf.storefront, abiStorefront, 'allowance', [wallet.address])
                if (res) return Number(res) / 10 ** conf.weth.precision
            }
		} catch (err:any) {
            console.log(err)
		}
		return 0
	}
    const approve = async (amount:number): Promise<SendTxResult> => {
		try {
			if (wallet.address) {
				const value = Math.round(amount * 10 ** conf.weth.precision);
				const hexValue = '0x'+JSBI.BigInt(value).toString(16)
				return await send( wallet.address, conf.weth.contract, '0x0', abiWETH, 'approve', [conf.storefront, hexValue] )
			} else {
                update({err:'🦊 Connect to Metamask'})
            }
		} catch (err:any) {
			update({err:err.message})
		}
		return { success: false }
	}
	const approveContract = async (): Promise<SendTxResult> => {
		try {
			if (wallet.address) {
				return await send( wallet.address, conf.storefront, '0x0', abiStorefront, 'setApprovalForAll', [conf.storefront, true] )
			} else {
                update({err:'🦊 Connect to Metamask'})
            }
		} catch (err:any) {
			update({err:err.message})
		}
		return { success: false }
	}
	const buy = async (params: any): Promise<SendTxResult> => {
		try {
			if (wallet.address) {
				return await send( wallet.address, conf.storefront,  params[4], abiStorefront, 'buy', params )
			} else {
                update({err:'🦊 Connect to Metamask'})
            }
		} catch (err:any) {
			update({err:err.message})
		}
		return { success: false }
	}
	
	const sell = async (params: any): Promise<SendTxResult> => {
		try {
			if (wallet.address) {
				return await send( wallet.address, conf.storefront, '0x0', abiStorefront, 'sell', params )
			} else {
                update({err:'🦊 Connect to Metamask'})
            }
		} catch (err:any) {
			update({err:err.message})
		}
		return { success: false }
	}

	const transfer = async (params: any): Promise<SendTxResult> => {
		try {
			if (wallet.address) {
				return await send( wallet.address, conf.storefront, '0x0', abiStorefront, 'transfer', params )
			} else {
                update({err:'🦊 Connect to Metamask'})
            }
		} catch (err:any) {
			update({err:err.message})
		}
		return { success: false }
	}
	return { ...wallet, connect, callMethod, send, waitTransaction, getEthers, getBalance, approval, approve, approveContract, buy, sell, transfer };
}

export default useWallet
