//npx hardhat deploy --tags ydcourse --network sepolia 
const { network } = require("hardhat")  
const { developmentChains, networkConfig, CONFIRMATIONS } = require("../helper-hardhat-config")  

module.exports = async ({ getNamedAccounts, deployments }) => {  
    const { deploy, log, get } = deployments  
    const { firstAccount } = await getNamedAccounts()  

    log("----------------------------------------------------")  
    log(`当前网络: ${network.name}`)  
    log(`部署账户: ${firstAccount}`)  
    log(`网络 Chain ID: ${network.config.chainId}`)  

    // 获取已部署的 YdToken 合约  
    const ydToken = await get("YdToken")  
    log(`YdToken 合约地址: ${ydToken.address}`)  

    // 部署 YdCourse 合约  
    const ydCourse = await deploy("YdCourse", {  
        from: firstAccount,  
        args: [ydToken.address], // 构造函数需要 YdToken 地址  
        log: true,  
        waitConfirmations: network.name === "hardhat" ? 1 : CONFIRMATIONS  
    })  

    log(`YdCourse 合约部署成功`)  
    log(`合约地址: ${ydCourse.address}`)  

    // 在非开发网络上进行合约验证  
    if (network.config.chainId == 11155111 && process.env.ETHRSCAN_API_KEY) {  
        log("正在验证合约...")  
        try {  
            await hre.run("verify:verify", {  
                address: ydCourse.address,  
                constructorArguments: [ydToken.address],  
            })  
            log("合约验证成功!")  
        } catch (error) {  
            log(`合约验证失败: ${error.message}`)  
            // 记录详细错误  
            log(error.stack)  
        }  
    } else {  
        log(`网络 ${network.name} 不支持验证，跳过...`)  
    }  

    log("----------------------------------------------------")  

    // 打印部署摘要  
    log("\n部署摘要:")  
    log(`YdToken 地址: ${ydToken.address}`)  
    log(`YdCourse 地址: ${ydCourse.address}`)  
    log(`部署账户: ${firstAccount}`)  
    log("----------------------------------------------------")  
}  

module.exports.tags = ["all", "ydcourse"]  
module.exports.dependencies = ["ydtoken"] // 确保 YdToken 先部署