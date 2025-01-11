const { ethers } = require("hardhat")  
const { expect } = require("chai")  

describe("YdCourse Unit Tests", function () {  
    let ydCourse  
    let ydToken  
    let owner, user1, user2  
    const INITIAL_SUPPLY = 1000000n // 100万代币  

    before(async function () {  
        // 获取签名者  
        [owner, user1, user2] = await ethers.getSigners()  

        // 部署 YD Token  
        const YdToken = await ethers.getContractFactory("YdToken")  
        ydToken = await YdToken.deploy()  
        await ydToken.waitForDeployment()  

        // 进行初始分配  
        const teamWallet = owner.address  
        const marketingWallet = user1.address  
        const communityWallet = user2.address  
        await ydToken.distributeInitialTokens(teamWallet, marketingWallet, communityWallet)  

        // 部署 YdCourse  
        const YdCourse = await ethers.getContractFactory("YdCourse")  
        ydCourse = await YdCourse.deploy(ydToken.target)  
        await ydCourse.waitForDeployment()  

        // 从团队钱包转一些代币给测试用户  
        // 团队钱包有20万代币(200,000)  
        await ydToken.transfer(user1.address, 10000n)  
        await ydToken.transfer(user2.address, 10000n)  

        console.log("初始化完成:")  
        console.log("Owner余额:", await ydToken.balanceOf(owner.address))  
        console.log("User1余额:", await ydToken.balanceOf(user1.address))  
        console.log("User2余额:", await ydToken.balanceOf(user2.address))  
    })  

    describe("Course Management", function () {  
        it("should add a new course correctly", async function () {  
            const courseName = "Solidity基础"  
            const coursePrice = 100n  
            const courseDesc = "面向初学者的Solidity课程"  

            await expect(ydCourse.addCourse(courseName, coursePrice, courseDesc))  
                .to.emit(ydCourse, "CourseCreated")  
                .withArgs(1n, courseName, coursePrice)  

            const course = await ydCourse.getCourse(1)  
            expect(course.name).to.equal(courseName)  
            expect(course.price).to.equal(coursePrice)  
            expect(course.description).to.equal(courseDesc)  
            expect(course.isActive).to.be.true  
        })  

        it("should update course correctly", async function () {  
            const newName = "Solidity进阶"  
            const newPrice = 200n  
            const newDesc = "更新后的课程描述"  
            const isActive = true  

            await expect(ydCourse.updateCourse(1, newName, newPrice, isActive, newDesc))  
                .to.emit(ydCourse, "CourseUpdated")  
                .withArgs(1n, newName, newPrice, isActive)  

            const course = await ydCourse.getCourse(1)  
            expect(course.name).to.equal(newName)  
            expect(course.price).to.equal(newPrice)  
            expect(course.description).to.equal(newDesc)  
        })  

        it("should fail when non-owner tries to add course", async function () {  
            await expect(  
                ydCourse.connect(user1).addCourse("测试课程", 100n, "测试描述")  
            ).to.be.revertedWithCustomError(ydCourse, "OwnableUnauthorizedAccount")  
        })  
    })  

    describe("Course Purchase", function () {  
        it("should allow user to purchase course", async function () {  
            // 用户授权YdCourse合约使用代币  
            await ydToken.connect(user1).approve(ydCourse.target, 1000n)  

            // 记录购买前的余额  
            const balanceBefore = await ydToken.balanceOf(user1.address)  

            // 购买课程  
            await expect(ydCourse.connect(user1).purchaseCourse(1))  
                .to.emit(ydCourse, "CoursePurchased")  
                .withArgs(user1.address, 1n, 200n) // 使用更新后的价格200  

            // 验证购买记录  
            const purchases = await ydCourse.getUserPurchases(user1.address)  
            expect(purchases.length).to.equal(1)  
            expect(purchases[0].courseId).to.equal(1n)  
            expect(purchases[0].price).to.equal(200n)  

            // 验证代币转移  
            const balanceAfter = await ydToken.balanceOf(user1.address)  
            expect(balanceBefore - balanceAfter).to.equal(200n)  
        })  

        it("should prevent duplicate purchase", async function () {  
            await expect(  
                ydCourse.connect(user1).purchaseCourse(1)  
            ).to.be.revertedWith("Course already purchased")  
        })  

        it("should fail when purchasing non-existent course", async function () {  
            await expect(  
                ydCourse.connect(user1).purchaseCourse(999)  
            ).to.be.revertedWith("Invalid course ID")  
        })  
    })  

    describe("Token Management", function () {  
        it("should allow owner to withdraw tokens", async function () {  
            const contractBalance = await ydToken.balanceOf(ydCourse.target)  
            await expect(ydCourse.withdrawTokens(contractBalance))  
                .to.changeTokenBalances(  
                    ydToken,  
                    [ydCourse, owner],  
                    [-contractBalance, contractBalance]  
                )  
        })  

        it("should prevent non-owner from withdrawing tokens", async function () {  
            await expect(  
                ydCourse.connect(user1).withdrawTokens(100n)  
            ).to.be.revertedWithCustomError(ydCourse, "OwnableUnauthorizedAccount")  
        })  
    })  
})