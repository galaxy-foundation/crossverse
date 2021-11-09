require('colors')
require('dotenv').config()

const { expect } = require("chai");
const { ethers } = require("hardhat");
const params = require("../params");
const config = require("../src/config/v1.json");
const abiWeth = require("../artifacts/contracts/WETH.sol/WETH.json");
const abiStorefront = require("../artifacts/contracts/StoreFront.sol/StoreFront.json");

const T = (text, len) => text + (len>text.length?" ".repeat(len - text.length) : '');
const toBigNum = (value,d) => ethers.utils.parseUnits(String(value), d);
const fromBigNum = (value,d) => ethers.utils.formatUnits(String(value), d);

const deployContracts = async () => {
	const [owner, signer, addr1, addr2, addr3, addr4] = await ethers.getSigners();
	const {wethAddress, admin, storeAddress, feeAddress, baseURI, feerate} = params;
	let   wETHAddress = wethAddress;
	let   precision = 0;
	const vAddrs = [addr1, addr2, addr3, addr4]
	const addrs = [addr1.address, addr2.address, addr3.address, addr4.address]
	const WETH = await ethers.getContractFactory("WETH")
	
	const weth = await WETH.deploy(addrs)
	await weth.deployed()
	wETHAddress = weth.address
	precision = await weth.decimals();
	const StoreFront = await ethers.getContractFactory("StoreFront")
	const storeFront = await StoreFront.deploy(wETHAddress, precision, admin, storeAddress, feeAddress, signer.address, baseURI, feerate)
	await storeFront.deployed()

	for(let i=0; i<addrs.length; i++) {
		const balance = await weth.balanceOf(addrs[i]);
		expect(fromBigNum(balance, 18)).to.equal("100.0");

		await weth.connect(vAddrs[i]).approve(storeFront.address, toBigNum(100, precision))
		let approval = await weth.allowance(addrs[i], storeFront.address);
		expect(fromBigNum(approval, 18)).to.equal("100.0");
	}

	return {owner, signer, addr1, addr2, addr3, addr4, wETHAddress, precision, weth, storeFront}
}

describe("Storefront", ()=>{

	it("test set auction winner", async ()=>{
		const {owner, signer, addr1, addr2, addr3, addr4, wETHAddress, precision, weth, storeFront} = await deployContracts();

		const buyer = addr1.address
		const tokenId = 100000052
		let tx = await storeFront.connect(signer).setAuctionWinner(tokenId, toBigNum(0.01, precision), 1, toBigNum(0.01, precision), addr1.address)
		await tx.wait();

		let balance = await storeFront.balanceOf(buyer, tokenId)
		expect(balance===1);
	});

	
	/* it("test buying", async ()=>{
		const {owner, signer, addr1, addr2, addr3, addr4, wETHAddress, precision, weth, storeFront} = await deployContracts();
		const pid = 1;
		const buyer = addr1.address
		const seller = addr2.address
		const price = toBigNum(0.01, precision).toHexString()
		const quantity = "0x1"
		const amount = toBigNum(0.01, precision).toHexString()
		const tokenId = 100000052
		const timestamp = Math.round(new Date().getTime()/1000)
		console.log(buyer, seller, tokenId, price, quantity, amount, timestamp)
		const singerAddress = await storeFront.signerAddress();
		console.log('singerAddress', singerAddress)
		console.log('singerAddress', signer.address)
		expect(singerAddress===signer.address, "invalid signer");

		const hash = await storeFront.getMessageHash(buyer, seller, tokenId, price, quantity, amount, timestamp);
		console.log('hash', hash)
		const signature = await signer.signMessage(hash)
		console.log('signature', signature)
		let tx = await storeFront.connect(addr1).buy(pid, tokenId, price, quantity, amount, timestamp, seller, signature)
		await tx.wait();
		let balance = await storeFront.balanceOf(buyer, tokenId)
		expect(balance===2);
	}); */
});
