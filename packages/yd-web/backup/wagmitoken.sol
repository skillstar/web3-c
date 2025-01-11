// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract BLONK_Token is ERC20 {
    constructor(
        string memory tokenName,
        string memory symbol
    ) ERC20(tokenName, symbol) {
        _mint(msg.sender, 1000000000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
