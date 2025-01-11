// SPDX-License-Identifier: MIT  
pragma solidity ^0.8.20;  

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";  
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";  
import "@openzeppelin/contracts/access/Ownable.sol";  

/**  
 * @title CourseNFT  
 * @dev 示例合约：包含可枚举功能 (ERC721Enumerable) + 所有权管理 (Ownable)  
 */  
contract CourseNFT is ERC721, ERC721Enumerable, Ownable {  
    // 记录每个 tokenId 的自定义 URI  
    mapping(uint256 => string) private _tokenURIs;  
    // 记录已有的总量  
    uint256 private _nextTokenId;  

    constructor(  
        string memory name_,   
        string memory symbol_  
    )  
        ERC721(name_, symbol_)         // 传入 ERC721 所需的 name 和 symbol  
        Ownable(msg.sender)            // 传入 Ownable 所需的初始 Owner  
    {  
        // 这里如果有初始化逻辑，可以加在构造函数体内  
    }  

    /**  
     * @notice 铸造 NFT 给指定地址，并设置对应的 tokenURI  
     */  
    function safeMint(  
        address to,   
        string memory tokenURI_  
    ) external onlyOwner {  
        uint256 tokenId = _nextTokenId++;  
        _safeMint(to, tokenId);  
        _tokenURIs[tokenId] = tokenURI_;  
    }  

    /**  
     * @notice 返回指定 tokenId 的 URI  
     */  
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {  
        // ERC721 内部提供的校验: tokenId 是否存在 (owner != 0)  
        require(_ownerOf(tokenId) != address(0), "ERC721: invalid token ID");  
        return _tokenURIs[tokenId];  
    }  

    /**  
     * @notice 获取某个地址下的所有 NFT (仅返回 tokenId 数组)  
     */  
    function getOwnedNFTs(address owner) external view returns (uint256[] memory) {  
        uint256 balance = balanceOf(owner);  
        uint256[] memory tokens = new uint256[](balance);  
        
        for (uint256 i = 0; i < balance; i++) {  
            tokens[i] = tokenOfOwnerByIndex(owner, i);  
        }  
        return tokens;  
    }  

    /**  
     * @notice 获取某个地址下所有 NFT 的 [tokenIds, tokenURIs]  
     */  
    function getOwnedNFTDetails(address owner)  
        external  
        view  
        returns (uint256[] memory tokenIds, string[] memory uris)  
    {  
        uint256 balance = balanceOf(owner);  
        tokenIds = new uint256[](balance);  
        uris = new string[](balance);  

        for (uint256 i = 0; i < balance; i++) {  
            uint256 tid = tokenOfOwnerByIndex(owner, i);  
            tokenIds[i] = tid;  
            uris[i] = _tokenURIs[tid];  
        }  
    }  

    /**  
     * @dev 由于 ERC721 与 ERC721Enumerable 都实现了 `_update` 方法，需要在此显式指定 override  
     */  
    function _update(address to, uint256 tokenId, address auth)  
        internal  
        virtual  
        override(ERC721, ERC721Enumerable)  
        returns (address)  
    {  
        return super._update(to, tokenId, auth);  
    }  

    /**  
     * @dev 同理，ERC721Enumerable 自身也重写了 `_increaseBalance`，我们需要明确调用顺序  
     */  
    function _increaseBalance(address account, uint128 value)  
        internal  
        virtual  
        override(ERC721, ERC721Enumerable)  
    {  
        super._increaseBalance(account, value);  
    }  

    /**  
     * @dev 同理，多个父类对 `supportsInterface` 有实现，要显式 override  
     */  
    function supportsInterface(bytes4 interfaceId)  
        public  
        view  
        virtual  
        override(ERC721, ERC721Enumerable)  
        returns (bool)  
    {  
        return super.supportsInterface(interfaceId);  
    }  
}