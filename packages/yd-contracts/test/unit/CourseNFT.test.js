const { expect } = require("chai");  
const { ethers } = require("hardhat");  

describe("CourseNFT", function () {  
  let CourseNFT, courseNFT;  
  let owner, user1, user2;  

  beforeEach(async function () {  
    [owner, user1, user2] = await ethers.getSigners();  

    // 获取合约工厂并部署  
    CourseNFT = await ethers.getContractFactory("CourseNFT");  
    courseNFT = await CourseNFT.deploy("Course NFT", "CNFT");  
    await courseNFT.waitForDeployment();  
  });  

  it("应该正确设置合约名与符号", async function () {  
    expect(await courseNFT.name()).to.equal("Course NFT");  
    expect(await courseNFT.symbol()).to.equal("CNFT");  
  });  

  it("Owner 能够铸造 NFT 并查看 tokenURI", async function () {  
    // 铸造前 balance  
    expect(await courseNFT.balanceOf(user1.address)).to.equal(0);  

    // 铸造给 user1  
    await courseNFT.safeMint(user1.address, "https://example.com/token/1");  

    // 铸造后 balance  
    expect(await courseNFT.balanceOf(user1.address)).to.equal(1);  

    // 获取 tokenId  
    const tokenId = await courseNFT.tokenOfOwnerByIndex(user1.address, 0);  
    expect(tokenId).to.equal(0); // 因为从 0 开始递增  

    // 检查 tokenURI  
    expect(await courseNFT.tokenURI(tokenId)).to.equal("https://example.com/token/1");  
  });  

  it("非 Owner 无法铸造 NFT", async function () {  
    await expect(  
      courseNFT.connect(user1).safeMint(user2.address, "https://example.com/token/2")  
    )  
      .to.be.revertedWithCustomError(courseNFT, "OwnableUnauthorizedAccount")  
      .withArgs(user1.address);  
  });  

  it("可以获取用户拥有的 NFT 数组", async function () {  
    // 铸造两个 NFT 给 user1  
    await courseNFT.safeMint(user1.address, "https://example.com/token/1");  
    await courseNFT.safeMint(user1.address, "https://example.com/token/2");  

    const tokenIds = await courseNFT.getOwnedNFTs(user1.address);  
    expect(tokenIds.length).to.equal(2);  
    expect(tokenIds[0]).to.equal(0);  
    expect(tokenIds[1]).to.equal(1);  
  });  

  it("可以获取用户拥有的 NFT 详细信息", async function () {  
    await courseNFT.safeMint(user1.address, "metadata1");  
    await courseNFT.safeMint(user1.address, "metadata2");  

    const [tokenIds, tokenURIs] = await courseNFT.getOwnedNFTDetails(user1.address);  
    expect(tokenIds.length).to.equal(2);  
    expect(tokenURIs.length).to.equal(2);  
    expect(tokenIds[0]).to.equal(0);  
    expect(tokenURIs[0]).to.equal("metadata1");  
    expect(tokenIds[1]).to.equal(1);  
    expect(tokenURIs[1]).to.equal("metadata2");  
  });  
});