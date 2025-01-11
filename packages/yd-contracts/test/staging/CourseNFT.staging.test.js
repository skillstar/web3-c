//npx hardhat test test/staging/CourseNFT.staging.test.js --network sepolia
// test/staging/CourseNFT.staging.test.js  

const { ethers, deployments, getNamedAccounts, network } = require("hardhat")  
const { expect } = require("chai")  
const { developmentChains } = require("../../helper-hardhat-config")  

developmentChains.includes(network.name)  
  ? describe.skip  
  : describe("CourseNFT Integration Tests", function () {  
    let courseNft  
    let owner, user  
    this.timeout(180000) // 3分钟超时，可根据需要调整  

    beforeEach(async () => {  
      // 每条测试都用 fixture 重置合约部署，保证测试独立  
      await deployments.fixture(["coursenft"])  

      const { firstAccount, secondAccount } = await getNamedAccounts()  
      owner = await ethers.getSigner(firstAccount)  
      user = await ethers.getSigner(secondAccount ?? 1)  

      const courseNftDeployment = await deployments.get("CourseNFT")  
      courseNft = await ethers.getContractAt("CourseNFT", courseNftDeployment.address)  
    })  

    it("可以获取合约名与符号", async function () {  
      const name = await courseNft.name()  
      const symbol = await courseNft.symbol()  
      expect(name).to.equal("Course NFT")  
      expect(symbol).to.equal("CNFT")  
    })  

    it("Owner 可以铸造 NFT 给 user", async () => {  
      // 检查 user 初始余额  
      expect(await courseNft.balanceOf(user.address)).to.equal(0)  

      // 使用 owner 账户铸造并显式设置 EIP-1559 参数  
      // 这里 maxFeePerGas = 30 gwei, maxPriorityFeePerGas = 2 gwei  
      // 一般可满足当前 Sepolia BaseFee 要求，如仍报错，可再调大  
      const tx = await courseNft.connect(owner).safeMint(user.address, "tokenURI1", {  
        maxFeePerGas: ethers.parseUnits("30", "gwei"),  
        maxPriorityFeePerGas: ethers.parseUnits("2", "gwei"),  
      })  

      // 等待一个区块确认  
      await tx.wait(1)  

      // 断言 user NFT 余额应为 1  
      expect(await courseNft.balanceOf(user.address)).to.equal(1)  
    })  

    it("非 Owner 无法铸造 NFT", async function () {  
      // 用非Owner账户铸造，期望报错  
      await expect(  
        courseNft.connect(user).safeMint(owner.address, "tokenURI2", {  
          maxFeePerGas: ethers.parseUnits("30", "gwei"),  
          maxPriorityFeePerGas: ethers.parseUnits("2", "gwei"),  
        })  
      ).to.be.reverted  
    })  

    it("多次铸造测试", async () => {  
      // 第一次铸造  
      let tx = await courseNft.connect(owner).safeMint(user.address, "tokenURI-A", {  
        maxFeePerGas: ethers.parseUnits("30", "gwei"),  
        maxPriorityFeePerGas: ethers.parseUnits("2", "gwei"),  
      })  
      await tx.wait(1)  

      // 空档期(可选)：如果仍遇到网络拥堵，可在此添加 setTimeout  

      // 第二次铸造  
      tx = await courseNft.connect(owner).safeMint(user.address, "tokenURI-B", {  
        maxFeePerGas: ethers.parseUnits("30", "gwei"),  
        maxPriorityFeePerGas: ethers.parseUnits("2", "gwei"),  
      })  
      await tx.wait(1)  

      const balance = await courseNft.balanceOf(user.address)  
      console.log("NFT balance for user:", balance.toString())  
      expect(balance).to.equal(2)  
    })  
  })