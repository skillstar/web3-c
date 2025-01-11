const { ethers } = require("hardhat")  
const https = require('https')  
const url = require('url')  

async function testRPCConnection(rpcUrl) {  
    return new Promise((resolve, reject) => {  
        const postData = JSON.stringify({  
            jsonrpc: "2.0",  
            method: "eth_blockNumber",  
            params: [],  
            id: 1  
        })  

        const parsedUrl = url.parse(rpcUrl)  
        const options = {  
            hostname: parsedUrl.hostname,  
            path: parsedUrl.path,  
            method: 'POST',  
            headers: {  
                'Content-Type': 'application/json',  
                'Content-Length': Buffer.byteLength(postData)  
            },  
            timeout: 5000  
        }  

        const req = https.request(options, (res) => {  
            let responseBody = ''  
            res.on('data', (chunk) => {  
                responseBody += chunk  
            })  
            res.on('end', () => {  
                try {  
                    const response = JSON.parse(responseBody)  
                    resolve(response.result !== undefined)  
                } catch (error) {  
                    resolve(false)  
                }  
            })  
        })  

        req.on('error', (error) => {  
            console.error('RPC 连接错误:', error)  
            resolve(false)  
        })  

        req.write(postData)  
        req.end()  
    })  
}  

async function checkNetwork() {  
    try {  
        console.log("🔍 开始网络诊断...")  
        
        // 获取 RPC URL  
        const rpcUrl = process.env.SEPOLIA_RPC_URL  
        console.log(`🌐 RPC URL: ${rpcUrl}`)  

        // 测试 RPC 连接  
        console.log("🔗 测试 RPC 连接...")  
        const rpcConnected = await testRPCConnection(rpcUrl)  
        console.log(`🔗 RPC 连接状态: ${rpcConnected ? '✅ 成功' : '❌ 失败'}`)  

        // 如果 RPC 连接成功，继续后续诊断  
        if (rpcConnected) {  
            const provider = new ethers.JsonRpcProvider(rpcUrl)  
            
            console.log("🕹️ 尝试获取网络信息...")  
            const network = await provider.getNetwork()  
            console.log(`🌍 网络名称: ${network.name}`)  
            console.log(`🆔 网络 Chain ID: ${network.chainId}`)  

            // 获取最新区块  
            const blockNumber = await provider.getBlockNumber()  
            console.log(`📦 最新区块高度: ${blockNumber}`)  

            // 检查账户  
            const accounts = await ethers.getSigners()  
            const deployer = accounts[0]  
            console.log(`👤 部署账户地址: ${deployer.address}`)  

            // 检查余额  
            const balance = await provider.getBalance(deployer.address)  
            console.log(`💰 账户余额: ${ethers.formatEther(balance)} ETH`)  
        }  

    } catch (error) {  
        console.error("❌ 网络诊断失败:", error)  
    }  
}  

checkNetwork()  