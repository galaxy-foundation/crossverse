require('dotenv').config()
require("@nomiclabs/hardhat-waffle");

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
		localhost: {
			url: "http://127.0.0.1:8545"
		},
		ganache :{
			url: "http://127.0.0.1:7545",
			accounts: [process.env.PRIVATEKEY]
		},
		icicb :{
			url: "https://mainnet-rpc.icicbchain.org",
			accounts: [process.env.PRIVATEKEY]
		},
		icicbtestnet :{
			url: "https://testnet-rpc.icicbchain.org",
			accounts: [process.env.PRIVATEKEY]
		},
		bsctestnet :{
			url: "http://185.25.48.34/api/v10/rpc/bsc-test",
			accounts: [process.env.PRIVATEKEY]
		},
		bsc :{
			url: "https://bsc-dataseed1.ninicoin.io/",
			accounts: [process.env.PRIVATEKEY]
		},
		fantomtestnet: {
			url: "https://rpc.testnet.fantom.network",
			accounts: [process.env.PRIVATEKEY]
		},
		fantom :{
			url: "https://rpc.ftm.tools/",
			accounts: [process.env.PRIVATEKEY]
		},
		ethereum :{
			url: "http://185.64.104.17",
			accounts: [process.env.PRIVATEKEY]
		},
		matic :{
			url: "https://rpc-mainnet.matic.quiknode.pro",
			accounts: [process.env.PRIVATEKEY]
		}
	},
	etherscan: {
		apiKey: ""
	},
  solidity: {
		compilers: [
			{
				version: "0.8.0",
				settings: {
					optimizer: {
						enabled: true,
						runs: 200,
					}
				}
			},
			{
				version: "0.4.24",
				settings: {
					optimizer: {
						enabled: true,
						runs: 200,
					}
				}
			}
		]
	},
	mocha: {
		timeout: 20000
	}
};
