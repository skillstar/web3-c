const { ethers, deployments, getNamedAccounts, network } = require("hardhat")  
const { expect } = require("chai")  
const { developmentChains } = require("../helper-hardhat-config")  

// 如果是开发网络就跳过，否则执行  
developmentChains.includes(network.name)  
    ? describe.skip  
    : describe("CourseNFT Integration Tests", function () {  
        let courseNft  
        let firstAccount, secondAccount  
        let owner, user  

        this.timeout(180000) // 3分钟超时，可自行调整  

        before(async function () {  
            console.log("\n准备测试环境...")  

            // 获取 namedAccounts  
            const namedAccts = await getNamedAccounts()  
            firstAccount = namedAccts.firstAccount  
            secondAccount = namedAccts.secondAccount  

            owner = await ethers.getSigner(firstAccount)  
            user = await ethers.getSigner(secondAccount || 1) // 如果没指定第二个号，就用索引1的账户  

            console.log("owner:", owner.address)  
            console.log("user:", user.address)  

            // 从 deployments 获取已经部署的 "CourseNFT"  
            // 要求之前已经执行过 npx hardhat deploy --tags coursenft --network <yourNetwork>  
            const courseNftDeployment = await deployments.get("CourseNFT")  
            courseNft = await ethers.getContractAt("CourseNFT", courseNftDeployment.address)  
            console.log("CourseNFT地址:", courseNft.target)  
        })  

        it("可以获取合约名与符号", async function () {  
            expect(await courseNft.name()).to.equal("Course NFT")  
            expect(await courseNft.symbol()).to.equal("CNFT")  
        })  

        it("Owner 可以铸造 NFT 给 user", async function () {  
            // 铸造前 user 没有 NFT  
            expect(await courseNft.balanceOf(user.address)).to.equal(0)  

            // 使用 owner 去铸造 NFT  
            await courseNft.connect(owner).safeMint(user.address, "https://example.com/metadata1")  

            // 铸造后 balance  
            expect(await courseNft.balanceOf(user.address)).to.equal(1)  
            const tokenId = await courseNft.tokenOfOwnerByIndex(user.address, 0)  
            expect(await courseNft.tokenURI(tokenId)).to.equal("https://example.com/metadata1")  
        })  

        it("非 Owner 无法铸造 NFT", async function () {  
            await expect(  
                courseNft.connect(user).safeMint(owner.address, "https://example.com/metadata2")  
            ).to.be.reverted // 或改成 to.be.revertedWithCustomError(...)  
        })  

        it("可以查询用户拥有的 NFT 列表和详情", async function () {  
            // 再给 user 多铸造一个  
            await courseNft.connect(owner).safeMint(user.address, "https://example.com/metadata2")  

            const ownedTokens = await courseNft.getOwnedNFTs(user.address)  
            console.log("用户当前 NFT 数组:", ownedTokens)  
            expect(ownedTokens.length).to.be.gte(1)  

            const [tokenIds, uris] = await courseNft.getOwnedNFTDetails(user.address)  
            console.log("用户 NFT 详情:", tokenIds, uris)  
            expect(tokenIds.length).to.equal(ownedTokens.length)  
        })  
    })