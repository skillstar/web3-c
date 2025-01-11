// SPDX-License-Identifier: MIT  
pragma solidity ^0.8.20;  

interface IMockCourseNFT {  
    function safeMint(address to, string memory tokenURI_) external;  
}  

contract MockCourseNFT {  
    // 记录一下铸造的数量、铸造情况，用于测试断言  
    uint256 public totalMinted;  
    mapping(uint256 => address) public owners;  
    mapping(uint256 => string) public tokenURIs;  

    // 简化：每次safeMint就让tokenId = totalMinted+1  
    function safeMint(address to, string memory tokenURI_) external {  
        totalMinted += 1;  
        owners[totalMinted] = to;  
        tokenURIs[totalMinted] = tokenURI_;  
    }  
}