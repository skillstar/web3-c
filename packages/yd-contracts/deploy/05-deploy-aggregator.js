const { network } = require("hardhat")  
const { developmentChains, CONFIRMATIONS } = require("../helper-hardhat-config")  

module.exports = async ({ getNamedAccounts, deployments }) => {  
    const { deploy, log } = deployments  
    const { firstAccount } = await getNamedAccounts()  

    log("----------------------------------------------------")  
    log(`当前网络: ${network.name}`)  
    log(`部署账户: ${firstAccount}`)  
    log(`网络 Chain ID: ${network.config.chainId}`)  

    // 部署 CourseProgressAggregator  
    const aggregator = await deploy("CourseProgressAggregator", {  
        from: firstAccount,  
        args: [], // 不需要构造函数参数  
        log: true,  
        waitConfirmations: network.name === "hardhat" ? 1 : CONFIRMATIONS,  
    })  

    log(`CourseProgressAggregator 合约部署成功`)  
    log(`合约地址: ${aggregator.address}`)  

    // Sepolia 验证  
    if (network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY) {  
        log("正在验证合约...")  
        try {  
            await hre.run("verify:verify", {  
                address: aggregator.address,  
                constructorArguments: [],  
            })  
            log("合约验证成功!")  
        } catch (error) {  
            log(`合约验证失败: ${error.message}`)  
        }  
    }  

    log("\n部署摘要:")  
    log(`CourseProgressAggregator 地址: ${aggregator.address}`)  
    log("----------------------------------------------------")  
}  

module.exports.tags = ["all", "aggregator"]