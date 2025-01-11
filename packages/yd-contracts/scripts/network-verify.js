const https = require('https')  
const { SocksProxyAgent } = require('socks-proxy-agent')  

async function testNetworkConnection() {  
    const proxyConfig = {  
        hostname: '127.0.0.1',  
        port: 7890,  
        type: 5 // SOCKS5  
    }  

    const testUrls = [  
        'https://api-sepolia.etherscan.io/api',  
        'https://sepolia.etherscan.io',  
        'https://eth-sepolia.g.alchemy.com'  
    ]  

    console.log("🔍 网络连接诊断...")  

    // 测试直接连接  
    console.log("\n🌐 直接连接测试:")  
    for (const testUrl of testUrls) {  
        try {  
            await testHttpsConnection(testUrl)  
            console.log(`✅ 直接连接成功: ${testUrl}`)  
        } catch (error) {  
            console.log(`❌ 直接连接失败: ${testUrl}`)  
            console.error(error)  
        }  
    }  

    // 测试代理连接  
    console.log("\n🌐 代理连接测试:")  
    const proxyAgent = new SocksProxyAgent(`socks5://${proxyConfig.hostname}:${proxyConfig.port}`)  
    
    for (const testUrl of testUrls) {  
        try {  
            await testHttpsConnection(testUrl, proxyAgent)  
            console.log(`✅ 代理连接成功: ${testUrl}`)  
        } catch (error) {  
            console.log(`❌ 代理连接失败: ${testUrl}`)  
            console.error(error)  
        }  
    }  
}  

function testHttpsConnection(urlString, proxyAgent = null) {  
    return new Promise((resolve, reject) => {  
        const options = {   
            method: 'GET',  
            timeout: 5000  
        }  

        if (proxyAgent) {  
            options.agent = proxyAgent  
        }  

        const req = https.request(urlString, options, (res) => {  
            resolve(true)  
        })  

        req.on('error', (error) => {  
            reject(error)  
        })  

        req.end()  
    })  
}  

testNetworkConnection()