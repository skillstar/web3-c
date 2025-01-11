// SPDX-License-Identifier: MIT  
pragma solidity ^0.8.20;  

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";  

contract MockAggregator is AggregatorV3Interface {  
    int256 private currentAnswer;  // 改名避免shadow  

    function latestRoundData()  
        external  
        view  
        override  
        returns (  
            uint80,  
            int256,  
            uint256,  
            uint256,  
            uint80  
        )  
    {  
        return (0, currentAnswer, 0, 0, 0);  
    }  

    function setAnswer(int256 newAnswer) external {  
        currentAnswer = newAnswer;  
    }  

    // 以下仅为满足接口编译  
    function decimals() external pure override returns (uint8) { return 0; }  
    function description() external pure override returns (string memory) { return "Mock"; }  
    function version() external pure override returns (uint256) { return 1; }  
    function getRoundData(uint80)  
        external  
        pure  
        override  
        returns (  
            uint80,  
            int256,  
            uint256,  
            uint256,  
            uint80  
        )  
    {  
        revert("Not implemented");  
    }  
}