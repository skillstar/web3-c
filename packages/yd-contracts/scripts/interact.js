const { ethers, network } = require("hardhat")  

async function main() {  
    // 获取合约  
    const YdTokenFactory = await ethers.getContractFactory("YdToken")  
    const [owner, teamWallet, marketingWallet, communityWallet] = await ethers.getSigners()  

    // 部署新合约（如果需要）  
    const ydToken = await YdTokenFactory.deploy()  
    await ydToken.waitForDeployment()  

    console.log("合约地址:", await ydToken.getAddress())  
    console.log("合约拥有者:", owner.address)  

    // 查询初始信息  
    console.log("代币名称:", await ydToken.name())  
    console.log("代币符号:", await ydToken.symbol())  
    console.log("总供应量:", ethers.formatUnits(await ydToken.totalSupply(), 18))  

    // 执行初始分配  
    console.log("\n开始代币分配...")  
    await ydToken.distributeInitialTokens(  
        teamWallet.address,  
        marketingWallet.address,  
        communityWallet.address  
    )  

    // 查询余额  
    console.log("\n余额详情:")  
    console.log("团队钱包余额:", ethers.formatUnits(  
        await ydToken.balanceOf(teamWallet.address), 18  
    ))  
    console.log("营销钱包余额:", ethers.formatUnits(  
        await ydToken.balanceOf(marketingWallet.address), 18  
    ))  
    console.log("社区钱包余额:", ethers.formatUnits(  
        await ydToken.balanceOf(communityWallet.address), 18  
    ))  
}  

main()  
    .then(() => process.exit(0))  
    .catch((error) => {  
        console.error(error)  
        process.exit(1)  
    })