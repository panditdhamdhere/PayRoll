// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title YieldStrategy
 * @dev DeFi yield generation strategy for unstreamed payroll funds
 * @notice This contract manages yield generation through various DeFi protocols
 */
contract YieldStrategy is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // ============ STRUCTS ============
    
    struct YieldPosition {
        address token;
        uint256 amount;
        uint256 timestamp;
        string protocol; // e.g., "Aave", "Compound", "Yearn"
        uint256 apy; // Annual percentage yield in basis points
    }

    // ============ STATE VARIABLES ============
    
    mapping(address => uint256) public totalDeposits;
    mapping(address => uint256) public totalWithdrawals;
    mapping(address => uint256) public totalYield;
    mapping(address => YieldPosition[]) public positions;
    
    address public payrollContract;
    uint256 public nextPositionId = 1;
    
    // Supported tokens and their yield strategies
    mapping(address => bool) public supportedTokens;
    mapping(address => address) public tokenStrategies; // Token => Strategy contract
    
    // ============ EVENTS ============
    
    event Deposit(address indexed token, uint256 amount, string protocol);
    event Withdrawal(address indexed token, uint256 amount, uint256 yield);
    event YieldGenerated(address indexed token, uint256 amount);
    event StrategyUpdated(address indexed token, address indexed strategy);
    event TokenSupported(address indexed token, bool supported);

    // ============ MODIFIERS ============
    
    modifier onlyPayrollContract() {
        require(msg.sender == payrollContract, "Only payroll contract");
        _;
    }
    
    modifier onlySupportedToken(address token) {
        require(supportedTokens[token], "Token not supported");
        _;
    }

    // ============ CONSTRUCTOR ============
    
    constructor() Ownable(msg.sender) {}

    // ============ DEPOSIT/WITHDRAWAL ============
    
    /**
     * @dev Deposit tokens for yield generation
     * @param token Token to deposit
     * @param amount Amount to deposit
     * @param protocol DeFi protocol to use
     * @param apy Expected APY in basis points
     */
    function deposit(
        address token,
        uint256 amount,
        string memory protocol,
        uint256 apy
    ) external onlyPayrollContract onlySupportedToken(token) nonReentrant {
        require(amount > 0, "Amount must be positive");
        require(apy > 0, "APY must be positive");
        
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        totalDeposits[token] += amount;
        
        YieldPosition memory position = YieldPosition({
            token: token,
            amount: amount,
            timestamp: block.timestamp,
            protocol: protocol,
            apy: apy
        });
        
        positions[token].push(position);
        
        emit Deposit(token, amount, protocol);
    }
    
    /**
     * @dev Withdraw tokens and yield
     * @param token Token to withdraw
     * @param amount Amount to withdraw
     * @return actualAmount Actual amount withdrawn
     * @return yieldAmount Yield amount generated
     */
    function withdraw(address token, uint256 amount) 
        external 
        onlyPayrollContract 
        onlySupportedToken(token) 
        nonReentrant 
        returns (uint256 actualAmount, uint256 yieldAmount) 
    {
        require(amount > 0, "Amount must be positive");
        require(totalDeposits[token] >= amount, "Insufficient deposits");
        
        // Calculate yield based on time and APY
        yieldAmount = _calculateYield(token, amount);
        actualAmount = amount + yieldAmount;
        
        // Update totals
        totalDeposits[token] -= amount;
        totalWithdrawals[token] += amount;
        totalYield[token] += yieldAmount;
        
        // Transfer tokens back to payroll contract
        IERC20(token).safeTransfer(msg.sender, actualAmount);
        
        emit Withdrawal(token, amount, yieldAmount);
        
        return (actualAmount, yieldAmount);
    }
    
    /**
     * @dev Calculate yield for a given amount and time
     * @param token Token address
     * @param amount Amount to calculate yield for
     * @return yieldAmount Calculated yield amount
     */
    function _calculateYield(address token, uint256 amount) internal view returns (uint256 yieldAmount) {
        YieldPosition[] memory tokenPositions = positions[token];
        uint256 totalYieldRate = 0;
        uint256 totalTime = 0;
        
        // Calculate weighted average APY and time
        for (uint256 i = 0; i < tokenPositions.length; i++) {
            YieldPosition memory position = tokenPositions[i];
            uint256 timeElapsed = block.timestamp - position.timestamp;
            
            totalYieldRate += position.apy * position.amount;
            totalTime += timeElapsed * position.amount;
        }
        
        if (totalYieldRate > 0 && totalTime > 0) {
            uint256 avgAPY = totalYieldRate / totalDeposits[token];
            uint256 avgTime = totalTime / totalDeposits[token];
            
            // Calculate yield: amount * APY * time / (365 days * 10000)
            yieldAmount = (amount * avgAPY * avgTime) / (365 days * 10000);
        }
    }

    // ============ STRATEGY MANAGEMENT ============
    
    /**
     * @dev Set payroll contract address
     * @param _payrollContract Address of the payroll contract
     */
    function setPayrollContract(address _payrollContract) external onlyOwner {
        require(_payrollContract != address(0), "Invalid address");
        payrollContract = _payrollContract;
    }
    
    /**
     * @dev Add or remove supported token
     * @param token Token address
     * @param supported Whether token is supported
     */
    function setSupportedToken(address token, bool supported) external onlyOwner {
        supportedTokens[token] = supported;
        emit TokenSupported(token, supported);
    }
    
    /**
     * @dev Set yield strategy for a token
     * @param token Token address
     * @param strategy Strategy contract address
     */
    function setTokenStrategy(address token, address strategy) external onlyOwner {
        require(supportedTokens[token], "Token not supported");
        tokenStrategies[token] = strategy;
        emit StrategyUpdated(token, strategy);
    }

    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get total yield generated for a token
     * @param token Token address
     * @return totalYieldAmount Total yield generated
     */
    function getTotalYield(address token) external view returns (uint256 totalYieldAmount) {
        return totalYield[token];
    }
    
    /**
     * @dev Get current yield rate for a token
     * @param token Token address
     * @return yieldRate Current yield rate in basis points
     */
    function getCurrentYieldRate(address token) external view returns (uint256 yieldRate) {
        YieldPosition[] memory tokenPositions = positions[token];
        uint256 totalWeightedAPY = 0;
        
        for (uint256 i = 0; i < tokenPositions.length; i++) {
            totalWeightedAPY += tokenPositions[i].apy * tokenPositions[i].amount;
        }
        
        if (totalDeposits[token] > 0) {
            yieldRate = totalWeightedAPY / totalDeposits[token];
        }
    }
    
    /**
     * @dev Get positions for a token
     * @param token Token address
     * @return tokenPositions Array of positions
     */
    function getPositions(address token) external view returns (YieldPosition[] memory tokenPositions) {
        return positions[token];
    }
    
    /**
     * @dev Get available balance for withdrawal
     * @param token Token address
     * @return availableBalance Available balance including yield
     */
    function getAvailableBalance(address token) external view returns (uint256 availableBalance) {
        uint256 currentBalance = IERC20(token).balanceOf(address(this));
        return currentBalance;
    }
}
