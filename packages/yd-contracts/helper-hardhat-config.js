const CONFIRMATIONS = 6  

const networkConfig = {  
    11155111: {  
        name: "sepolia",
        courseProgressAddress: "0x957eDACC02cC5eA49584Bb06D568304fBC81d657",  
        aggregatorAddress: "0x4F51626f276715b6c660C33B2552C47f1618b572", // 替换为实际的 Aggregator 合约地址  
        nftAddress: "0x7121f1DBB04b6C4694Dc9DFe770432847A06Bf3d",              // 替换为实际的 NFT 合约地址  
    }  
}  

const developmentChains = ["hardhat", "localhost"]  

module.exports = {  
    networkConfig,  
    developmentChains,  
    CONFIRMATIONS  
}