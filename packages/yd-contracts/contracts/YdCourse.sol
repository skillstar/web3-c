// SPDX-License-Identifier: MIT  
pragma solidity ^0.8.20;  

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; 

contract YdCourse is Ownable {  
    // YD token 合约地址  
    IERC20 public ydToken;  
    
    // 课程结构  
    struct Course {  
        string name;  
        uint256 price;  // 价格（以YD token计价）  
        bool isActive;  
        string description;  
    }  
    
    // 购买记录结构  
    struct Purchase {  
        uint256 courseId;  
        uint256 timestamp;  
        uint256 price;  
    }  
    
    // 存储课程  
    mapping(uint256 => Course) public courses;  
    // 用户购买记录  
    mapping(address => Purchase[]) public userPurchases;  
    // 课程总数  
    uint256 public courseCount;  
    
    // 事件  
    event CourseCreated(uint256 indexed courseId, string name, uint256 price);  
    event CoursePurchased(address indexed buyer, uint256 indexed courseId, uint256 price);  
    event CourseUpdated(uint256 indexed courseId, string name, uint256 price, bool isActive);  
    
    constructor(address _ydTokenAddress) Ownable(msg.sender) {  
        ydToken = IERC20(_ydTokenAddress);  
    }  
    
    // 添加新课程（仅管理员）  
    function addCourse(  
        string memory name,  
        uint256 price,  
        string memory description  
    ) external onlyOwner {  
        courseCount++;  
        courses[courseCount] = Course({  
            name: name,  
            price: price,  
            isActive: true,  
            description: description  
        });  
        
        emit CourseCreated(courseCount, name, price);  
    }  
    
    // 更新课程信息（仅管理员）  
    function updateCourse(  
        uint256 courseId,  
        string memory name,  
        uint256 price,  
        bool isActive,  
        string memory description  
    ) external onlyOwner {  
        require(courseId > 0 && courseId <= courseCount, "Invalid course ID");  
        
        Course storage course = courses[courseId];  
        course.name = name;  
        course.price = price;  
        course.isActive = isActive;  
        course.description = description;  
        
        emit CourseUpdated(courseId, name, price, isActive);  
    }  
    
    // 购买课程  
    function purchaseCourse(uint256 courseId) external {  
        require(courseId > 0 && courseId <= courseCount, "Invalid course ID");  
        Course storage course = courses[courseId];  
        require(course.isActive, "Course is not active");  
        
        // 检查用户是否已购买过该课程  
        Purchase[] storage purchases = userPurchases[msg.sender];  
        for(uint i = 0; i < purchases.length; i++) {  
            require(purchases[i].courseId != courseId, "Course already purchased");  
        }  
        
        // 转移YD token  
        require(  
            ydToken.transferFrom(msg.sender, address(this), course.price),  
            "Token transfer failed"  
        );  
        
        // 记录购买  
        userPurchases[msg.sender].push(Purchase({  
            courseId: courseId,  
            timestamp: block.timestamp,  
            price: course.price  
        }));  
        
        emit CoursePurchased(msg.sender, courseId, course.price);  
    }  
    
    // 查询用户购买的所有课程  
    function getUserPurchases(address user) external view returns (Purchase[] memory) {  
        return userPurchases[user];  
    }  
    
    // 查询课程详情  
    function getCourse(uint256 courseId) external view returns (Course memory) {  
        require(courseId > 0 && courseId <= courseCount, "Invalid course ID");  
        return courses[courseId];  
    }  
    
    // 提取合约中的YD token（仅管理员）  
    function withdrawTokens(uint256 amount) external onlyOwner {  
        require(  
            ydToken.transfer(owner(), amount),  
            "Token transfer failed"  
        );  
    }  
}