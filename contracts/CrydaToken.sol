// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * CRYDA Token - ERC20 token for the ride-sharing platform
 */
contract CrydaToken is ERC20, Ownable {
    
    // Token details
    uint8 private constant _decimals = 18;
    uint256 private constant INITIAL_SUPPLY = 1000000000 * 10**_decimals; // 1 billion tokens
    
    // Minting control
    uint256 public maxSupply = 10000000000 * 10**_decimals; // 10 billion max supply
    
    // Events
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    
    constructor(address initialOwner) ERC20("Cryda Token", "CRYDA") Ownable(initialOwner) {
        _mint(initialOwner, INITIAL_SUPPLY);
    }
    
    /**
     * @dev Mint new tokens (only owner can mint)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= maxSupply, "Exceeds max supply");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @dev Burn tokens from sender's balance
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }
    
    /**
     * @dev Get token decimals
     */
    function decimals() public pure override returns (uint8) {
        return _decimals;
    }
}
