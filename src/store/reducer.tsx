import { now } from '@/utils/helper';
import { createSlice } from '@reduxjs/toolkit'



const initialState: ReducerState = {
	connected: false,
	connecting: false,
	checkingBalance: false,
	address: '',
	ETH: 0,
	WETH: 0,
	balance: 0,
	err:''
}

export const getConnected = ():boolean => {
	const time = window.sessionStorage.getItem("wallet_connected");
	if (!time) return false;
	return now() - Number(time) < 3600
}

export const setConnected = () => {
	return window.sessionStorage.setItem("wallet_connected", String(now()))
}

export default createSlice({
	name: 'share',
	initialState,
	reducers: {
		update: (state:any, action) => {
			for (const k in action.payload) {
				if (state[k] === undefined) new Error('🦊 undefined account item')
				state[k] = action.payload[k]
			}
			if (action.payload.connected) setConnected()
		}
	}
})
