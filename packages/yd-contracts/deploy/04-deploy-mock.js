const { network } = require("hardhat")  
const { developmentChains, networkConfig, CONFIRMATIONS } = require("../helper-hardhat-config")  

module.exports = async ({ getNamedAccounts, deployments }) => {  
    const { deploy, log } = deployments  
    const { firstAccount } = await getNamedAccounts()  

    if (!developmentChains.includes(network.name)) return  

    log("----------------------------------------------------")  
    log(`当前网络: ${network.name}`)  
    log(`部署账户: ${firstAccount}`)  
    log(`网络 Chain ID: ${network.config.chainId}`)  
    log("正在部署 Mock 合约...")  

    // 部署 MockAggregator  
    const mockAggregator = await deploy("MockAggregator", {  
        from: firstAccount,  
        args: [],  
        log: true,  
        waitConfirmations: network.name === "hardhat" ? 1 : CONFIRMATIONS,  
    })  

    // 部署 MockCourseNFT  
    const mockNft = await deploy("MockCourseNFT", {  
        from: firstAccount,  
        args: [],  
        log: true,  
        waitConfirmations: network.name === "hardhat" ? 1 : CONFIRMATIONS,  
    })  

    log("Mock 合约部署完成!")  
    log(`MockAggregator 地址: ${mockAggregator.address}`)  
    log(`MockCourseNFT 地址: ${mockNft.address}`)  
    log("----------------------------------------------------")  
}  

module.exports.tags = ["all", "mocks"]  