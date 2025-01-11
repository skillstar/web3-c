require("@chainlink/env-enc").config()
require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("hardhat-deploy-ethers");
require("@nomicfoundation/hardhat-verify");


const SEPOLIA_URL = process.env.SEPOLIA_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const PRIVATE_KEY_1 = process.env.PRIVATE_KEY_1
const PRIVATE_KEY_2 = process.env.PRIVATE_KEY_2
const PRIVATE_KEY_3 = process.env.PRIVATE_KEY_3
const PRIVATE_KEY_4 = process.env.PRIVATE_KEY_4
const ETHRSCAN_API_KEY = process.env.ETHRSCAN_API_KEY
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  defaultNetwork: "hardhat",
  networks: {
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [PRIVATE_KEY, PRIVATE_KEY_1,PRIVATE_KEY_2,PRIVATE_KEY_3,PRIVATE_KEY_4],
      chainId: 11155111
    }
  },
  etherscan: {
    apiKey: {
      sepolia: ETHRSCAN_API_KEY
    }
  },
  namedAccounts: {
    firstAccount: {
      default: 0
    },
    secondAccount: {
      default: 1
    },
    thirdAccount: {  
      default: 2  
    },  
    fourthAccount: {  
      default: 3  
    },  
    fifthAccount: {  
      default: 4  
    }  
  },
  gasReporter: {
    enabled: false
  }
};



//npx typechain --target ethers-v6 --out-dir typechain-types './artifacts/contracts/YdToken.sol/YdToken.json' 

