// SPDX-License-Identifier: MIT  
pragma solidity ^0.8.20;  

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";  
import "@openzeppelin/contracts/access/Ownable.sol";  

contract YdToken is ERC20, Ownable {  
    // 代币参数  
    uint256 public constant TOKENS_PER_ETH = 1000;    // 1 ETH = 1000 tokens  
    uint256 public constant MAX_SUPPLY = 1000000;     // 最大供应量 100万  
    uint256 public price = 0.001 ether;                   // 初始价格 0.001 ETH  

    // 分配比例  
    uint256 public constant TEAM_ALLOCATION = 200000;      // 团队分配 20%  
    uint256 public constant MARKETING_ALLOCATION = 100000; // 营销分配 10%  
    uint256 public constant COMMUNITY_ALLOCATION = 100000; // 社区分配 10%  

    // 状态变量  
    bool public initialDistributionDone;  
    
    // 事件  
    event TokensPurchased(address indexed buyer, uint256 ethAmount, uint256 tokenAmount);  
    event TokensSold(address indexed seller, uint256 tokenAmount, uint256 ethAmount);  
    event PriceUpdated(uint256 newPrice);  
    event InitialDistributionCompleted(  
        address teamWallet,  
        address marketingWallet,  
        address communityWallet  
    );  
    event ETHWithdrawn(address indexed owner, uint256 amount);  
    event ReceivedETH(address indexed sender, uint256 amount);  
    event FallbackCalled(address indexed sender, uint256 amount, bytes data);  

    // 构造函数  
    constructor() ERC20("YiDeng Token", "YD") Ownable(msg.sender){  
        // 设置代币精度为0，即不使用小数位  
        _mint(address(this), MAX_SUPPLY);  
    }  

    // 重写decimals函数，将精度设为0  
    function decimals() public pure override returns (uint8) {  
        return 0;  
    }  

    // 初始代币分配  
    function distributeInitialTokens(  
        address teamWallet,  
        address marketingWallet,  
        address communityWallet  
    ) external onlyOwner {  
        require(!initialDistributionDone, "Initial distribution already completed");  
        require(  
            teamWallet != address(0) &&  
            marketingWallet != address(0) &&  
            communityWallet != address(0),  
            "Invalid address"  
        );  

        // 转移代币给各个钱包  
        _transfer(address(this), teamWallet, TEAM_ALLOCATION);  
        _transfer(address(this), marketingWallet, MARKETING_ALLOCATION);  
        _transfer(address(this), communityWallet, COMMUNITY_ALLOCATION);  

        initialDistributionDone = true;  

        emit InitialDistributionCompleted(  
            teamWallet,  
            marketingWallet,  
            communityWallet  
        );  
    }  

    // 购买代币  
    function buyTokens() external payable {  
        require(msg.value >= price, "Insufficient ETH sent");  
        require(initialDistributionDone, "Initial distribution not completed");  

        uint256 tokenAmount = (msg.value * TOKENS_PER_ETH) / 1 ether;  
        require(tokenAmount > 0, "Token amount too small");  
        require(balanceOf(address(this)) >= tokenAmount, "Insufficient tokens in contract");  

        _transfer(address(this), msg.sender, tokenAmount);  
        
        emit TokensPurchased(msg.sender, msg.value, tokenAmount);  
    }  

    // 卖出代币  
    function sellTokens(uint256 tokenAmount) external {  
        require(tokenAmount > 0, "Amount must be greater than 0");  
        require(balanceOf(msg.sender) >= tokenAmount, "Insufficient token balance");  

        uint256 ethAmount = (tokenAmount * 1 ether) / TOKENS_PER_ETH;  
        require(address(this).balance >= ethAmount, "Insufficient ETH in contract");  

        _transfer(msg.sender, address(this), tokenAmount);  

        (bool success, ) = payable(msg.sender).call{value: ethAmount}("");  
        require(success, "ETH transfer failed");  

        emit TokensSold(msg.sender, tokenAmount, ethAmount);  
    }  

    // 更新代币价格（仅管理员）  
    function updatePrice(uint256 newPrice) external onlyOwner {  
        require(newPrice > 0, "Invalid price");  
        price = newPrice;  
        emit PriceUpdated(newPrice);  
    }  

    // 提取合约中的ETH（仅管理员）  
    function withdrawETH() external onlyOwner {  
        uint256 balance = address(this).balance;  
        require(balance > 0, "No ETH to withdraw");  

        (bool success, ) = payable(owner()).call{value: balance}("");  
        require(success, "ETH transfer failed");  

        emit ETHWithdrawn(owner(), balance);  
    }  

    // 查询合约ETH余额  
    function getContractBalance() external view returns (uint256) {  
        return address(this).balance;  
    }  

    // 查询合约代币余额  
    function getContractTokenBalance() external view returns (uint256) {  
        return balanceOf(address(this));  
    }  

    // 查询当前代币价格  
    function getCurrentPrice() external view returns (uint256) {  
        return price;  
    }  

    // 接收ETH  
    receive() external payable {  
        emit ReceivedETH(msg.sender, msg.value);  
    }  

    // 处理未知调用  
    fallback() external payable {  
        emit FallbackCalled(msg.sender, msg.value, msg.data);  
    }  
}