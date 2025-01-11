const { run } = require("hardhat");  
const https = require('https');  
const HttpsProxyAgent = require('https-proxy-agent');  

async function verify() {  
    const contractAddress = "0x35B5F0F27652953704Df88C7d29833CBB192A96A";  
    
    // 设置全局代理（如果需要）  
    if (process.env.HTTPS_PROXY) {  
        const proxyAgent = new HttpsProxyAgent(process.env.HTTPS_PROXY);  
        https.globalAgent = proxyAgent;  
    }  

    console.log("开始验证合约...");  
    try {  
        await run("verify:verify", {  
            address: contractAddress,  
            constructorArguments: [],  
            timeout: 60000, // 增加超时时间  
        });  
        console.log("合约验证成功!");  
    } catch (error) {  
        if (error.message.includes("Already Verified")) {  
            console.log("合约已经验证过了!");  
        } else {  
            console.error("验证失败:", error);  
        }  
    }  
}  

verify()  
    .then(() => process.exit(0))  
    .catch((error) => {  
        console.error(error);  
        process.exit(1);  
    });