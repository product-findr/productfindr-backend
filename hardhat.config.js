require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require('@openzeppelin/hardhat-upgrades');

require("dotenv").config({ path: ".env" });

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    base: {
      url: "https://sepolia.base.org",
      chainId: 84532,
      accounts: [PRIVATE_KEY],
      // verify: {
      //   etherscan: {
      //     apiUrl: "https://api-sepolia.basescan.org",
      //     apiKey: process.env.ETHERSCAN_API_KEY,
      //   },
      // },
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
    apiUrl: "https://api-sepolia.basescan.org/api",
  },
};
