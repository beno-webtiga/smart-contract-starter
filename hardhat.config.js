require("@nomicfoundation/hardhat-toolbox");
require('@openzeppelin/hardhat-upgrades');
require("dotenv").config();

const infuraApiKey = process.env.INFURA_API_KEY;
const adminPrivateKey = process.env.ADMIN_PRIV_KEY;
const etherscanApiKey = process.env.ETHERSCAN_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [{
      version: '0.8.20',
      settings: {
        optimizer: { enabled: true, runs: 1000000 }
      }
    },
    {
      version: '0.8.19',
      settings: {
        optimizer: { enabled: true, runs: 1000000 }
      }
    }]
  },

  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${infuraApiKey}`,
      chainId: 0xaa36a7,
      accounts: [adminPrivateKey],
    },
    bsc_testnet: {
      url: `https://data-seed-prebsc-1-s1.binance.org:8545`,
      chainId: 0x61,
      accounts: [adminPrivateKey],
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${infuraApiKey}`,
      chainId: 0x13881,
      accounts: [adminPrivateKey],
    }
  },
  etherscan: {
    apiKey: etherscanApiKey
  }
};
