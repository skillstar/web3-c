const { expect } = require("chai");  
const { ethers } = require("hardhat");  

describe("YdToken", function () {  
  let ydToken, owner, teamWallet, marketingWallet, communityWallet, user;  

  beforeEach(async function () {  
    [owner, teamWallet, marketingWallet, communityWallet, user] = await ethers.getSigners();  

    const YdToken = await ethers.getContractFactory("YdToken");  
    ydToken = await YdToken.deploy();  
  });  

  describe("Deployment", function () {  
    it("Should set the correct token name and symbol", async function () {  
      expect(await ydToken.name()).to.equal("YiDeng Token");  
      expect(await ydToken.symbol()).to.equal("YD");  
      expect(await ydToken.decimals()).to.equal(0);  
    });  

    it("Should have correct initial supply", async function () {  
      expect(await ydToken.getContractTokenBalance()).to.equal(1000000);  
    });  
  });  

  describe("Initial Distribution", function () {  
    it("Should distribute initial tokens correctly", async function () {  
      await ydToken.distributeInitialTokens(  
        teamWallet.address,   
        marketingWallet.address,   
        communityWallet.address  
      );  

      expect(await ydToken.balanceOf(teamWallet.address)).to.equal(200000);  
      expect(await ydToken.balanceOf(marketingWallet.address)).to.equal(100000);  
      expect(await ydToken.balanceOf(communityWallet.address)).to.equal(100000);  
      expect(await ydToken.initialDistributionDone()).to.be.true;  
    });  

    it("Should prevent multiple initial distributions", async function () {  
      await ydToken.distributeInitialTokens(  
        teamWallet.address,   
        marketingWallet.address,   
        communityWallet.address  
      );  

      await expect(  
        ydToken.distributeInitialTokens(  
          teamWallet.address,   
          marketingWallet.address,   
          communityWallet.address  
        )  
      ).to.be.revertedWith("Initial distribution already completed");  
    });  
  });  

  describe("Token Purchasing", function () {  
    beforeEach(async function () {  
      await ydToken.distributeInitialTokens(  
        teamWallet.address,   
        marketingWallet.address,   
        communityWallet.address  
      );  
    });  

    it("Should allow buying tokens", async function () {  
      await ydToken.connect(user).buyTokens({ value: ethers.parseEther("0.002") });  // 使用更小的测试金额  
      
      const userBalance = await ydToken.balanceOf(user.address);  
      expect(userBalance).to.equal(2);  // 0.002 ETH * 1000 tokens/ETH = 2 tokens  
  });  

    it("Should prevent buying before initial distribution", async function () {  
      const YdToken = await ethers.getContractFactory("YdToken");  
      const newYdToken = await YdToken.deploy();  

      await expect(  
        newYdToken.connect(user).buyTokens({ value: ethers.parseEther("1") })  
      ).to.be.revertedWith("Initial distribution not completed");  
    });  

    it("Should prevent buying with insufficient ETH", async function () {  
      await expect(  
        ydToken.connect(user).buyTokens({ value: ethers.parseEther("0.0005") })  
      ).to.be.revertedWith("Insufficient ETH sent");  
    });  
  });  

  describe("Token Selling", function () {  
    beforeEach(async function () {  
      await ydToken.distributeInitialTokens(  
        teamWallet.address,   
        marketingWallet.address,   
        communityWallet.address  
      );  

      // 向合约发送ETH  
      await owner.sendTransaction({  
        to: await ydToken.getAddress(),  
        value: ethers.parseEther("10")  
      });  

      // 用户购买代币  
      await ydToken.connect(user).buyTokens({ value: ethers.parseEther("1") });  
    });  

    it("Should allow selling tokens", async function () {  
      const initialUserTokenBalance = await ydToken.balanceOf(user.address);  
      const initialContractEthBalance = await ethers.provider.getBalance(await ydToken.getAddress());  

      await ydToken.connect(user).sellTokens(1000);  

      const finalUserTokenBalance = await ydToken.balanceOf(user.address);  
      const finalContractEthBalance = await ethers.provider.getBalance(await ydToken.getAddress());  

      expect(finalUserTokenBalance).to.equal(initialUserTokenBalance - 1000n);  
      expect(finalContractEthBalance).to.equal(initialContractEthBalance - ethers.parseEther("1"));  
    });  

    it("Should prevent selling with insufficient tokens", async function () {  
      await expect(  
        ydToken.connect(user).sellTokens(2000)  
      ).to.be.revertedWith("Insufficient token balance");  
    });  
  });  

  describe("Price Management", function () {  
    it("Should allow owner to update price", async function () {  
      const newPrice = ethers.parseEther("2");  
      await ydToken.updatePrice(newPrice);  

      expect(await ydToken.getCurrentPrice()).to.equal(newPrice);  
    });  

    it("Should prevent non-owner from updating price", async function () {  
      const newPrice = ethers.parseEther("2");  
      await expect(  
        ydToken.connect(user).updatePrice(newPrice)  
      ).to.be.revertedWithCustomError(ydToken, "OwnableUnauthorizedAccount");  
    });  
  });  

  describe("ETH Withdrawal", function () {  
    beforeEach(async function () {  
      await owner.sendTransaction({  
        to: await ydToken.getAddress(),  
        value: ethers.parseEther("5")  
      });  
    });  

    it("Should allow owner to withdraw ETH", async function () {  
      // 向合约发送一些ETH  
      await owner.sendTransaction({  
        to: await ydToken.getAddress(),  
        value: ethers.parseEther("5")  
      });  
    
      // 获取合约的初始ETH余额  
      const initialContractBalance = await ethers.provider.getBalance(await ydToken.getAddress());  
      
      // 执行提取  
      const tx = await ydToken.withdrawETH();  
      
      // 获取合约的最终ETH余额  
      const finalContractBalance = await ethers.provider.getBalance(await ydToken.getAddress());  
      
      // 验证合约ETH余额已清空  
      expect(finalContractBalance).to.equal(0n);  
      
      // 验证提取事件  
      await expect(tx)  
        .to.emit(ydToken, "ETHWithdrawn")  
        .withArgs(owner.address, initialContractBalance);  
    });

    it("Should prevent non-owner from withdrawing ETH", async function () {  
      await expect(  
        ydToken.connect(user).withdrawETH()  
      ).to.be.revertedWithCustomError(ydToken, "OwnableUnauthorizedAccount");  
    });  
  });  

  describe("Receive and Fallback", function () {  
    it("Should emit ReceivedETH when sending ETH directly", async function () {  
      await expect(  
        owner.sendTransaction({  
          to: await ydToken.getAddress(),  
          value: ethers.parseEther("1")  
        })  
      ).to.emit(ydToken, "ReceivedETH").withArgs(owner.address, ethers.parseEther("1"));  
    });  
  });  
});