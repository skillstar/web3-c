const { ethers, deployments, getNamedAccounts } = require("hardhat")  
const { assert, expect } = require("chai")  
const { developmentChains } = require("../../helper-hardhat-config")  

developmentChains.includes(network.name)  
    ? describe.skip  
    : describe("YdToken Integration Tests", async function () {  
        let ydToken  
        let firstAccount, secondAccount, thirdAccount  
        let owner, user, community    

        this.timeout(180000) // 3分钟  

        before(async function () {  
            console.log("\n准备测试环境...")  
            
            // 使用 getNamedAccounts 获取账户  
            const  {   
                firstAccount,   
                secondAccount,   
                thirdAccount,    
            } = await getNamedAccounts()  


            // 设置owner和user  
            owner = await ethers.getSigner(firstAccount)  // 使用firstAccount作为owner  
            user = await ethers.getSigner(secondAccount)  // 使用secondAccount作为user  
            community = await ethers.getSigner(thirdAccount)

            console.log("部署账户:", firstAccount)  
            console.log("合约所有者:", owner.address)  
            console.log("测试用户:", user.address)  
            console.log("社区钱包:", community.address)  

            // 检查用户ETH余额  
            const userBalance = await ethers.provider.getBalance(user.address)  
            console.log("测试用户ETH余额:", ethers.formatEther(userBalance), "ETH")  

            try {  
                const ydTokenDeployment = await deployments.get("YdToken")  
                ydToken = await ethers.getContractAt("YdToken", ydTokenDeployment.address)  
                console.log("合约地址:", ydToken.target)  

                // 检查初始状态  
                const price = await ydToken.price()  
                const tokensPerEth = await ydToken.TOKENS_PER_ETH()  
                console.log("代币单价:", ethers.formatEther(price), "ETH")  
                console.log("每ETH可购买代币数:", tokensPerEth.toString())  
                
                const totalSupply = await ydToken.totalSupply()  
                console.log("当前总供应量:", totalSupply.toString())  
            } catch (error) {  
                console.error("合约准备失败:", error)  
                throw error  
            }  
        })  

        it("should verify basic contract state", async function () {  
          const name = await ydToken.name()  
          const symbol = await ydToken.symbol()  
          const totalSupply = await ydToken.totalSupply()  
          const price = await ydToken.price()  
          
          console.log("\n基本状态检查:")  
          console.log("代币名称:", name)  
          console.log("代币符号:", symbol)  
          console.log("总供应量:", totalSupply.toString())  
          console.log("代币价格:", ethers.formatEther(price), "ETH")  
          
          expect(name).to.equal("YiDeng Token")  
          expect(symbol).to.equal("YD") 
          expect(totalSupply).to.equal(1000000n) // 100万代币  
      })  

        it("should complete initial distribution", async function() {  
            const isDistributed = await ydToken.initialDistributionDone()  
            if (!isDistributed) {  
                console.log("\n执行初始分配...")  
                
                console.log("团队钱包:", owner.address)  
                console.log("营销钱包:", user.address)  
                console.log("社区钱包:", community.address) 

                const tx = await ydToken.connect(owner).distributeInitialTokens(  
                    owner.address,  // 团队钱包  
                    user.address,   // 营销钱包  
                    community.address // 社区钱包  
                )  
                const receipt = await tx.wait()  
                console.log("初始分配交易已确认")  

                // 验证分配结果  
                const teamBalance = await ydToken.balanceOf(owner.address)  
                const marketingBalance = await ydToken.balanceOf(user.address)  
                const communityBalance = await ydToken.balanceOf(community.address)  

                console.log("团队钱包余额:", teamBalance.toString())  
                console.log("营销钱包余额:", marketingBalance.toString())  
                console.log("社区钱包余额:", communityBalance.toString())  

                expect(teamBalance).to.equal(200000n)      // 20%  
                expect(marketingBalance).to.equal(100000n) // 10%  
                expect(communityBalance).to.equal(100000n) // 10%  
            } else {  
                console.log("\n初始分配已完成")  
            }  
            
            // 确认初始分配状态  
            expect(await ydToken.initialDistributionDone()).to.be.true  
        })  

        it("should buy tokens with minimum amount", async function () {  
            try {  
                // 确保初始分配已完成  
                const isDistributed = await ydToken.initialDistributionDone()  
                if (!isDistributed) {  
                    console.log("初始分配未完成，跳过测试")  
                    this.skip()  
                    return  
                }  

                // 使用0.002 ETH购买代币  
                const purchaseAmount = ethers.parseEther("0.002")  
                
                console.log("\n开始购买测试:")  
                console.log("计划购买金额:", ethers.formatEther(purchaseAmount), "ETH")  
                
                // 检查用户余额  
                const ethBalance = await ethers.provider.getBalance(user.address)  
                console.log("用户ETH余额:", ethers.formatEther(ethBalance), "ETH")  

                // 确保用户有足够的ETH  
                if (ethBalance < purchaseAmount) {  
                    console.log("用户ETH余额不足，跳过测试")  
                    this.skip()  
                    return  
                }  

                // 记录购买前的代币余额  
                const initialBalance = await ydToken.balanceOf(user.address)  
                console.log("初始代币余额:", initialBalance.toString())  

                // 购买代币  
                console.log("发起购买交易...")  
                const buyTx = await ydToken.connect(user).buyTokens({  
                    value: purchaseAmount  
                })  
                console.log("等待交易确认...")  
                const buyReceipt = await buyTx.wait()  
                console.log("交易已确认")  

                // 验证购买后的余额  
                const finalBalance = await ydToken.balanceOf(user.address)  
                console.log("购买后代币余额:", finalBalance.toString())  

                // 验证事件  
                const events = buyReceipt.logs.filter(  
                    log => log.fragment && log.fragment.name === "TokensPurchased"  
                )  
                expect(events.length).to.be.gt(0)  
                console.log("购买事件验证成功")  

                // 计算预期获得的代币数量  
                const tokensPerEth = await ydToken.TOKENS_PER_ETH()  
                const expectedTokens = (purchaseAmount * tokensPerEth) / ethers.parseEther("1")  
                console.log("预期获得代币:", expectedTokens.toString())  
                expect(finalBalance - initialBalance).to.equal(expectedTokens)  
            } catch (error) {  
                console.error("购买测试失败:", error)  
                throw error  
            }  
        })  

        it("should show final contract state", async function () {  
            console.log("\n最终状态检查:")  
            const price = await ydToken.price()  
            const contractBalance = await ethers.provider.getBalance(ydToken.target)  
            const userTokenBalance = await ydToken.balanceOf(user.address)  
            const userEthBalance = await ethers.provider.getBalance(user.address)  
            const contractTokenBalance = await ydToken.balanceOf(ydToken.target) 
            const communityTokenBalance = await ydToken.balanceOf(community.address)  
            
            console.log("当前代币价格:", ethers.formatEther(price), "ETH")  
            console.log("合约ETH余额:", ethers.formatEther(contractBalance), "ETH")  
            console.log("合约代币余额:", contractTokenBalance.toString())  
            console.log("用户代币余额:", userTokenBalance.toString())  
            console.log("用户ETH余额:", ethers.formatEther(userEthBalance), "ETH")
            console.log("社区钱包代币余额:", communityTokenBalance.toString())  
        })  
    })