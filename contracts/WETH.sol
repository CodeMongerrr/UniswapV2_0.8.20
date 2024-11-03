// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract WETH is ERC20, ReentrancyGuard {
    /// @notice Events for deposit and withdrawal
    event Deposit(address indexed sender, uint256 amount);
    event Withdrawal(address indexed sender, uint256 amount);

    constructor() ERC20("Wrapped Ether", "WETH") {}

    /// @notice Allows users to deposit ETH and receive WETH
    function deposit() public payable nonReentrant {
        require(msg.value > 0, "Must deposit some ETH");
        _mint(msg.sender, msg.value);
        emit Deposit(msg.sender, msg.value);
    }

    /// @notice Allows users to withdraw their ETH by burning WETH
    function withdraw(uint256 amount) public nonReentrant {
        require(amount > 0, "Must withdraw some ETH");
        require(balanceOf(msg.sender) >= amount, "Insufficient WETH balance");

        _burn(msg.sender, amount);
        
        // Use call instead of transfer to avoid gas limitations
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "ETH transfer failed");
        
        emit Withdrawal(msg.sender, amount);
    }

    /// @notice Allows users to deposit ETH directly by sending it to the contract
    receive() external payable {
        deposit();
    }

    /// @dev Fallback function is called when msg.data is not empty
    fallback() external payable {
        deposit();
    }
}