// npx hardhat test test/staging/CourseProgress.staging.test.js --network sepolia

const { ethers, getNamedAccounts, network } = require("hardhat")  
const { expect } = require("chai")  
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")  

developmentChains.includes(network.name)  
    ? describe.skip  
    : describe("CourseProgress Integration Tests", function () {  
        let courseProgress, aggregator, nft  
        let firstAccount, secondAccount  
        this.timeout(180000) // 3分钟超时  

        before(async () => {  
            // 获取你的实际账户  
            const namedAccts = await getNamedAccounts()  
            firstAccount = namedAccts.firstAccount  
            secondAccount = namedAccts.secondAccount  

            // 获取签名者  
            const firstSigner = await ethers.getSigner(firstAccount)  
            const secondSigner = await ethers.getSigner(secondAccount)  

            // 获取网络配置  
            const chainId = network.config.chainId  
            const addresses = networkConfig[chainId]  

            console.log("正在连接合约...")  
            
            // 连接到实际部署的合约  
            courseProgress = await ethers.getContractAt(  
                "CourseProgress",  
                addresses.courseProgressAddress  
            )  
            
            aggregator = await ethers.getContractAt(  
                "CourseProgressAggregator",  
                addresses.aggregatorAddress  
            )  
            
            nft = await ethers.getContractAt(  
                "CourseNFT",  
                addresses.nftAddress  
            )  

            console.log("----------------------------------------------------")  
            console.log("测试环境准备完成")  
            console.log(`First Account: ${firstAccount}`)  
            console.log(`Second Account: ${secondAccount}`)  
            console.log(`CourseProgress 地址: ${await courseProgress.getAddress()}`)  
            console.log(`Aggregator 地址: ${await aggregator.getAddress()}`)  
            console.log(`NFT 地址: ${await nft.getAddress()}`)  
            console.log("----------------------------------------------------")  

            // 验证合约所有者  
            const aggregatorOwner = await aggregator.owner()  
            console.log(`Aggregator 所有者: ${aggregatorOwner}`)  
            if (aggregatorOwner.toLowerCase() !== firstAccount.toLowerCase()) {  
                throw new Error("First Account 不是 Aggregator 合约的所有者")  
            }  
        })  
        it("完整业务流程测试", async function () {  
            try {  
                const courseId = 1  
                const courseCid = "QmV3c612XAtzdDi69cGvZC5tjWmHh7aXBJPx5sC7EMfpbX"  
                
                const firstSigner = await ethers.getSigner(firstAccount)  
                const secondSigner = await ethers.getSigner(secondAccount)  
        
                // 1. 检查合约地址和所有权  
                console.log("\n检查合约配置...")  
                const courseProgressAddress = await courseProgress.getAddress()  
                const aggregatorAddress = await aggregator.getAddress()  
                const nftAddress = await nft.getAddress()  
                
                console.log(`CourseProgress地址: ${courseProgressAddress}`)  
                console.log(`Aggregator地址: ${aggregatorAddress}`)  
                console.log(`NFT地址: ${nftAddress}`)  
        
                // 2. 检查 NFT 合约所有者  
                console.log("\n检查NFT合约所有权...")  
                const nftOwner = await nft.owner()  
                console.log(`NFT合约当前所有者: ${nftOwner}`)  
                console.log(`CourseProgress合约地址: ${courseProgressAddress}`)  
        
                // 3. 如果 NFT 合约所有者不是 CourseProgress，则转移所有权  
                if (nftOwner.toLowerCase() !== courseProgressAddress.toLowerCase()) {  
                    console.log("转移NFT合约所有权给CourseProgress合约...")  
                    const transferTx = await nft.connect(firstSigner).transferOwnership(courseProgressAddress)  
                    await transferTx.wait(1)  
                    console.log("所有权转移完成")  
                    
                    // 验证所有权转移  
                    const newOwner = await nft.owner()  
                    console.log(`NFT合约新所有者: ${newOwner}`)  
                    if (newOwner.toLowerCase() !== courseProgressAddress.toLowerCase()) {  
                        throw new Error("NFT合约所有权转移失败")  
                    }  
                }  
        
                // 4. 检查进度  
                console.log("\n检查Aggregator进度...")  
                const [, initialProgress] = await aggregator.latestRoundData()  
                console.log(`当前进度: ${initialProgress}`)  
        
                // 5. 设置进度为100  
                if (initialProgress.toString() !== "100") {  
                    console.log("设置进度为100...")  
                    const progressTx = await aggregator.connect(firstSigner).setProgress(100, {  
                        maxFeePerGas: ethers.parseUnits("30", "gwei"),  
                        maxPriorityFeePerGas: ethers.parseUnits("2", "gwei"),  
                    })  
                    await progressTx.wait(1)  
                    console.log("进度设置完成")  
                }  
        
                // 6. 检查CID  
                console.log("\n检查课程CID...")  
                try {  
                    const currentCid = await courseProgress.getCourseCID(courseId)  
                    console.log(`当前CID: ${currentCid}`)  
                    
                    if (currentCid !== courseCid) {  
                        console.log("设置新的CID...")  
                        const cidTx = await courseProgress.connect(firstSigner).setCourseCID(courseId, courseCid, {  
                            maxFeePerGas: ethers.parseUnits("30", "gwei"),  
                            maxPriorityFeePerGas: ethers.parseUnits("2", "gwei"),  
                        })  
                        await cidTx.wait(1)  
                        console.log("CID设置完成")  
                    }  
                } catch (error) {  
                    console.log("设置新的CID...")  
                    const cidTx = await courseProgress.connect(firstSigner).setCourseCID(courseId, courseCid, {  
                        maxFeePerGas: ethers.parseUnits("30", "gwei"),  
                        maxPriorityFeePerGas: ethers.parseUnits("2", "gwei"),  
                    })  
                    await cidTx.wait(1)  
                    console.log("CID设置完成")  
                }  
        
                // 7. 检查用户是否已经拥有NFT  
                console.log("\n检查用户NFT状态...")  
                const userBalance = await nft.balanceOf(secondAccount)  
                console.log(`用户当前NFT余额: ${userBalance}`)  
        
                // 8. 执行铸造  
                console.log("\n执行铸造...")  
                console.log(`铸造给用户: ${secondAccount}`)  
                console.log(`课程ID: ${courseId}`)  
        
                const mintTx = await courseProgress.connect(firstSigner).checkAndMint(  
                    secondAccount,  
                    courseId,  
                    {  
                        maxFeePerGas: ethers.parseUnits("30", "gwei"),  
                        maxPriorityFeePerGas: ethers.parseUnits("2", "gwei"),  
                        gasLimit: 500000,  
                    }  
                )  
                
                console.log("等待铸造交易确认...")  
                const receipt = await mintTx.wait(1)  
                console.log(`铸造交易哈希: ${mintTx.hash}`)  
        
                // 9. 验证铸造结果  
                const newBalance = await nft.balanceOf(secondAccount)  
                console.log(`铸造后用户NFT余额: ${newBalance}`)  
                
                if (newBalance.toString() === userBalance.toString()) {  
                    throw new Error("铸造似乎失败了 - NFT余额未增加")  
                }  
        
                // 10. 获取用户的 NFT 详情  
                const [tokenIds, uris] = await nft.getOwnedNFTDetails(secondAccount)  
                console.log("\n用户NFT详情:")  
                for (let i = 0; i < tokenIds.length; i++) {  
                    console.log(`TokenID: ${tokenIds[i]}, URI: ${uris[i]}`)  
                }  
        
            } catch (error) {  
                console.error("\n测试失败:")  
                console.error(`错误消息: ${error.message}`)  
                
                // 尝试解码错误  
                if (error.data) {  
                    try {  
                        const iface = new ethers.Interface([  
                            "error CIDNotSet(uint256)",  
                            "error ProgressNotEnough(uint256)",  
                            "error AlreadyMinted(address,uint256)"  
                        ])  
                        const decodedError = iface.parseError(error.data)  
                        console.error(`解码后的错误: ${decodedError.name}`)  
                        console.error(`错误参数: ${decodedError.args}`)  
                    } catch (e) {  
                        console.error("无法解码错误数据")  
                    }  
                }  
                
                throw error  
            }  
        })
    })