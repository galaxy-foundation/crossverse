require('colors')
require('dotenv').config()
const fs = require('fs')
const hre = require("hardhat")
/* const {ethers} = require("ethers"); */
const params = require("../params");
const config = require("../src/config/v1.json");
/* const abiWeth = require("../artifacts/contracts/WETH.sol/WETH.json"); */
const abiStorefront = require("../artifacts/contracts/StoreFront.sol/StoreFront.json");

const T = (text, len) => text + (len>text.length ? " ".repeat(len - text.length) : '');

(async ()=>{
	const chainid = Number(process.env.CHAINID)
	const network = {
		title: "Ethereum mainnet",
		rpc: "https://mainnet.infura.io/v3/b25ceaa391d24b6da7dd81a4c96b4b95",
		explorer: "https://etherscan.io/",
		blocktime: 15,
		confirmations: 12,
	}

	const {wethAddress, admin, storeAddress, feeAddress, signerAddress, baseURI, feerate} = params;
	/* console.log(admin, storeAddress, feeAddress, signerAddress, baseURI, feerate); */
	let   wETHAddress = wethAddress;
	let   precision = 18;
	const conf = config[chainid] || network;
	if (wETHAddress===null) {
		let testAddress1 = '0x81477d5014adb4B4a57029c848B3df4a797Ab849';
		let testAddress2 = '0xC5df89579D7A2f85b8a4b1a6395083da394Bba92';
		const WETH = await hre.ethers.getContractFactory("WETH")
		const weth = await WETH.deploy([testAddress1, testAddress2])
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
	fs.writeFileSync(`./src/config/v1.json`,  JSON.stringify({...config, [chainid]:{...conf, storefront:storeFront.address, weth:{contract:wETHAddress, precision}}}, null, 4))
})().then(() => process.exit(0)).catch((error) => {
	console.error(error)
	process.exit(1)
})