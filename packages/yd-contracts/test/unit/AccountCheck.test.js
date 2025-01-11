const { ethers, getNamedAccounts } = require("hardhat")  
//npx hardhat test test/unit/AccountCheck.test.js  --network sepolia 
describe("Account Check", async function () {  
    it("should print all account addresses", async function () {  
        console.log("\n=== 账户地址检查 ===")  
        
        // 获取命名账户  
        const {  
            firstAccount,  
            secondAccount,  
            thirdAccount,  
            fourthAccount,  
            fifthAccount  
        } = await getNamedAccounts()  

        // 打印所有账户地址  
        console.log("\n通过 getNamedAccounts 获取的地址:")  
        console.log("firstAccount:", firstAccount)  
        console.log("secondAccount:", secondAccount)  
        console.log("thirdAccount:", thirdAccount)  
        console.log("fourthAccount:", fourthAccount)  
        console.log("fifthAccount:", fifthAccount)  

        // 获取对应的 Signer 对象并打印地址  
        console.log("\n转换为 Signer 后的地址:")  
        const owner = await ethers.getSigner(firstAccount)  
        const user1 = await ethers.getSigner(secondAccount)  
        const user2 = await ethers.getSigner(thirdAccount)  
        console.log("owner address:", owner.address)  
        console.log("user1 address:", user1.address)  
        console.log("user2 address:", user2.address)  

        // 为了比较，也打印 getSigners() 的结果  
        console.log("\n通过 getSigners 获取的地址:")  
        const signers = await ethers.getSigners()  
        console.log("signers[0]:", signers[0].address)  
        console.log("signers[1]:", signers[1].address)  
        console.log("signers[2]:", signers[2].address)  
    })  
})