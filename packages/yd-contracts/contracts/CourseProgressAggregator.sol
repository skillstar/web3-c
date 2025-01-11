// SPDX-License-Identifier: MIT  
pragma solidity ^0.8.20;  

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";  

/**
 * @title CourseProgressAggregator
 * @notice 自定义“课程进度聚合器”合约。模拟Chainlink Aggregator，可被外部(前端/节点)调用以写入进度值。
 *         其他合约(例如 MyOracle.sol)通过latestRoundData()来读取当前进度.
 */
contract CourseProgressAggregator is AggregatorV3Interface {
    // 当前进度(0~100)
    int256 private _currentProgress;

    // (可选) 可设置合约所有者权限
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    /**
     * @dev 设置新的进度值(0~100)。外部合约或前端可直接调用.
     */
    function setProgress(int256 newProgress) external onlyOwner {
        // 可做一些校验 newProgress 在 [0,100] 范围内
        require(newProgress >= 0 && newProgress <= 100, "Invalid progress");
        _currentProgress = newProgress;
    }

    /**
     * @notice Chainlink Aggregator 标准接口：返回最新一轮数据
     *         这里仅返回 _currentProgress，其他字段都用0代替
     */
    function latestRoundData()
        external
        view
        override
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (
            0,
            _currentProgress,
            0,
            0,
            0
        );
    }

    // 下面几个函数是Chainlink Aggregator接口必须的
    function decimals() external pure override returns (uint8) { return 0; }
    function description() external pure override returns (string memory) { return "Custom course progress aggregator"; }
    function version() external pure override returns (uint256) { return 1; }
    function getRoundData(uint80)
        external
        pure
        override
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        revert("Not implemented");
    }
}