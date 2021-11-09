require('dotenv').config()
module.exports = {
	wethAddress: process.env.WETH || null,
	admin: process.env.ADMIN,
	storeAddress: process.env.STORE,
	feeAddress: process.env.FEEADDRESS,
	signerAddress: process.env.SIGNER,
	baseURI: process.env.BASEURI,
	feerate: process.env.FEERATE
}
