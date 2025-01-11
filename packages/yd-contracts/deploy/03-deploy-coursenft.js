const { network } = require("hardhat")  
const { developmentChains, networkConfig, CONFIRMATIONS } = require("../helper-hardhat-config")  

module.exports = async ({ getNamedAccounts, deployments }) => {  
    const { deploy, log } = deployments  
    const { firstAccount } = await getNamedAccounts()  

    log("----------------------------------------------------")  
    log(`当前网络: ${network.name}`)  
    log(`部署账户: ${firstAccount}`)  
    log(`网络 Chain ID: ${network.config.chainId}`)  

    // 部署 CourseNFT 合约。根据你的构造函数，传入 (name, symbol) 两个参数  
    const courseNft = await deploy("CourseNFT", {  
        from: firstAccount,  
        args: ["Course NFT", "CNFT"], // 构造函数需要的 name, symbol  
        log: true,  
        waitConfirmations: network.name === "hardhat" ? 1 : CONFIRMATIONS,  
    })  

    log(`CourseNFT 合约部署成功`)  
    log(`合约地址: ${courseNft.address}`)  

    // 如果在特定网络(此处以sepolia为例)上，并且有ETHERSCAN_API_KEY，就进行合约验证  
    if (network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY) {  
        log("正在验证合约...")  
        try {  
            await hre.run("verify:verify", {  
                address: courseNft.address,  
                constructorArguments: ["Course NFT", "CNFT"],  
            })  
            log("合约验证成功!")  
        } catch (error) {  
            log(`合约验证失败: ${error.message}`)  
            log(error.stack)  
        }  
    } else {  
        log(`网络 ${network.name} 不支持验证，跳过...`)  
    }  

    log("----------------------------------------------------")  

    // 打印一些部署信息  
    log("\n部署摘要:")  
    log(`YdNFT 地址: ${courseNft.address}`)  
    log(`部署账户: ${firstAccount}`)  
    log("----------------------------------------------------")  
}  

module.exports.tags = ["all", "coursenft"]  
