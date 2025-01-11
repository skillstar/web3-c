const { expect } = require("chai");  
const { ethers } = require("hardhat");  

describe("CourseProgress", function () {  
  let owner, user;  
  let aggregatorMock, nftMock, courseProgress;  

  before(async () => {  
    [owner, user] = await ethers.getSigners();  
  });  

  beforeEach(async () => {  
    // 1) 部署 MockAggregator  
    const AggregatorFactory = await ethers.getContractFactory("MockAggregator");  
    aggregatorMock = await (await AggregatorFactory.deploy()).waitForDeployment();  

    // 2) 部署 MockCourseNFT  
    const NftFactory = await ethers.getContractFactory("MockCourseNFT");  
    nftMock = await (await NftFactory.deploy()).waitForDeployment();  
    
    // 3) 部署 CourseProgress  
    const ProgressFactory = await ethers.getContractFactory("CourseProgress");  
    courseProgress = await (await ProgressFactory.deploy(  
      await aggregatorMock.getAddress(),  // 使用 getAddress() 获取地址  
      await nftMock.getAddress()          // 使用 getAddress() 获取地址  
    )).waitForDeployment();  
  });  

  it("Should set courseId -> CID, check aggregator progress, and mint NFT if >=100", async () => {  
    // 初始：NFT合约中尚未铸造任何token  
    expect(await nftMock.totalMinted()).to.equal(0);  

    // (a) 设置 courseId=1 对应的CID  
    await courseProgress.setCourseCID(1, "QmABC123XYZ");  

    // (b) aggregator 先设置answer=99 => 不应铸造  
    await aggregatorMock.setAnswer(99);  
    await courseProgress.checkAndMint(user.address, 1);  
    expect(await nftMock.totalMinted()).to.equal(0);  //没铸造  

    // (c) aggregator设置answer=100 => 触发铸造  
    await aggregatorMock.setAnswer(100);  
    await courseProgress.checkAndMint(user.address, 1);  

    // NFT合约应增加1个铸造  
    expect(await nftMock.totalMinted()).to.equal(1);  

    // 检查刚才那次铸造的所有者 & tokenURI  
    const ownerOf1 = await nftMock.owners(1);  
    const uriOf1 = await nftMock.tokenURIs(1);  
    expect(ownerOf1).to.equal(user.address);  
    // tokenURI 拼接为 ipfs://QmABC123XYZ  
    expect(uriOf1).to.equal("ipfs://QmABC123XYZ");  
  });  

  it("Should revert if no CID set but progress >=100", async () => {  
    // aggregator设置>=100  
    await aggregatorMock.setAnswer(200);  

    // 未调用setCourseCID, 直接checkAndMint => expect revert  
    await expect(  
      courseProgress.checkAndMint(user.address, 999)  
    ).to.be.revertedWith("CID not set for this courseId");  
  });  
});