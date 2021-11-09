require('colors')
require('dotenv').config()
const fs = require('fs')
const hre = require("hardhat")
/* const {ethers} = require("ethers"); */
const config = require("../src/config/v1.json");
/* const abiWeth = require("../artifacts/contracts/WETH9.sol/WETH9.json"); */
const abiStorefront = require("../artifacts/contracts/StoreFront.sol/StoreFront.json");

const T = (text, len) => text + (len>text.length?" ".repeat(len - text.length) : '');

(async ()=>{
	const chainid = Number(process.env.CHAINID)
	const network = {
		title: "ICICB Chain Testnet",
		rpc: "https://testnet-rpc.icicbchain.org",
		explorer: "https://testnet-explorer.icicbchain.org",
		blocktime: 1,
		confirmations: 1,
	}

	let   wETHAddress = null
	let   precision = 0;

	const admin = "0x82bC5Cd564EA21642910796aE7Ec675772AE642F"
	const storeAddress = "0x413EBD57EbA0f200ed592c31E7dB6119C92A7973"
	const feeAddress = "0x9156ee434e4Cce6ab3Bf2dDD452ae6cf61B3E68C"
	const signerAddress = "0xCcC2fcaeeA78A87e002ab8fEFfd23eedc19CDE07"
	const baseURI = "https://crossverse.io/artwork/view/"
	const feerate = 500

	const conf = config[chainid] || network;
	if (wETHAddress===null) {
		const WETH = await hre.ethers.getContractFactory("WETH9")
		const weth = await WETH.deploy()
		await weth.deployed()
		wETHAddress = weth.address
		precision = await weth.decimals();
		console.log(T("WETH deployed to:", 25).green, wETHAddress.yellow)
	}
	const StoreFront = await hre.ethers.getContractFactory("StoreFront")
	const storeFront = await StoreFront.deploy(wETHAddress, precision, admin, storeAddress, feeAddress, signerAddress, baseURI, feerate)
	await storeFront.deployed()
	console.log(T("storeFront deployed to:", 25).green, storeFront.address.yellow)
	console.log('writing abis and addresses...'.blue);
	/* -------------- writing... -----------------*/
	fs.writeFileSync(`./src/config/abi/storefront.json`,  JSON.stringify(abiStorefront.abi, null, 4));
	fs.writeFileSync(`./src/config/v11.json`,  JSON.stringify({...config, [chainid]:{...conf, storefront:storeFront.address, weth:{contract:wETHAddress, precision}}}, null, 4))
})().then(() => process.exit(0)).catch((error) => {
	console.error(error)
	process.exit(1)
})
