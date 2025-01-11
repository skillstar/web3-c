// SPDX-License-Identifier: MIT  
pragma solidity ^0.8.20;  

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";  

/**  
 * @dev 你的NFT合约接口，只需包含要调用的函数签名即可  
 *      这里对应CourseNFT的safeMint(address,string)  
 */  
interface ICourseNFT {  
    function safeMint(address to, string memory tokenURI_) external;  
}  

contract CourseProgress {  
    AggregatorV3Interface public aggregator;   // Chainlink Aggregator  
    ICourseNFT public courseNft;              // 你的NFT合约  
    address public owner;  

    // 记录所有 courseId 对应的 IPFS CID  
    mapping(uint256 => string) private courseCIDs;  

    event ProgressChecked(int256 progress, address indexed user, uint256 courseId);  
    event NftMinted(address indexed user, uint256 courseId, string tokenURI);  

    constructor(address aggregatorAddress, address nftContractAddress) {  
        aggregator = AggregatorV3Interface(aggregatorAddress);  
        courseNft = ICourseNFT(nftContractAddress);  
        owner = msg.sender;  
    }  

    modifier onlyOwner() {  
        require(msg.sender == owner, "Not owner");  
        _;  
    }  

    /**  
     * @dev 设置指定 courseId 对应的 IPFS CID  
     *      例如: courseId=1 -> "QmABC..."  
     */  
    function setCourseCID(uint256 courseId, string calldata cid) external onlyOwner {  
        courseCIDs[courseId] = cid;  
    }  
    
    function getCourseCID(uint256 courseId) public view returns (string memory) {  
        return courseCIDs[courseId];  
    }  
    /**  
     * @dev 读取 aggregator 最新进度，当进度≥100时自动给 user 铸造  
     *      对应 courseId 的 NFT(其 tokenURI = "ipfs://<cid>")  
     */  
    function checkAndMint(address user, uint256 courseId) external onlyOwner {  
        // 读取Aggregator中的进度  
        ( , int256 answer, , , ) = aggregator.latestRoundData();  

        emit ProgressChecked(answer, user, courseId);  

        // 检查进度  
        if (answer >= 100) {  
            // 找到事先登记好的CID  
            string memory cid = courseCIDs[courseId];  
            require(bytes(cid).length > 0, "CID not set for this courseId");  

            // 拼接成完整的 ipfs://URI  
            string memory tokenURI_ = string(abi.encodePacked("ipfs://", cid));  

            // 铸造NFT  
            courseNft.safeMint(user, tokenURI_);  
            emit NftMinted(user, courseId, tokenURI_);  
        }  
    }  
}