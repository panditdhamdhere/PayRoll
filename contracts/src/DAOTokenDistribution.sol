// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title DAOTokenDistribution
 * @dev DAO governance token distribution for payroll participants
 * @notice This contract manages the distribution of governance tokens to employees
 */
contract DAOTokenDistribution is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    // ============ STRUCTS ============
    
    struct TokenAllocation {
        address token;
        uint256 totalAllocation;
        uint256 distributedAmount;
        uint256 vestingPeriod; // In seconds
        uint256 cliffPeriod; // In seconds
        bool isActive;
    }
    
    struct EmployeeAllocation {
        uint256 allocationId;
        uint256 totalAmount;
        uint256 claimedAmount;
        uint256 startTime;
        uint256 vestingEndTime;
        bool isActive;
    }
    
    struct VestingSchedule {
        uint256 startTime;
        uint256 endTime;
        uint256 totalAmount;
        uint256 claimedAmount;
        bool isLinear; // true for linear, false for cliff
    }

    // ============ STATE VARIABLES ============
    
    mapping(uint256 => TokenAllocation) public tokenAllocations;
    mapping(address => mapping(uint256 => EmployeeAllocation)) public employeeAllocations;
    mapping(address => uint256[]) public employeeAllocationIds;
    mapping(address => bool) public authorizedPayrolls;
    
    uint256 public nextAllocationId = 1;
    
    // ============ EVENTS ============
    
    event TokenAllocationCreated(
        uint256 indexed allocationId,
        address indexed token,
        uint256 totalAllocation,
        uint256 vestingPeriod,
        uint256 cliffPeriod
    );
    
    event EmployeeAllocated(
        address indexed employee,
        uint256 indexed allocationId,
        uint256 amount,
        uint256 startTime,
        uint256 vestingEndTime
    );
    
    event TokensClaimed(
        address indexed employee,
        uint256 indexed allocationId,
        uint256 amount,
        uint256 totalClaimed
    );
    
    event AllocationDeactivated(uint256 indexed allocationId);
    event PayrollAuthorized(address indexed payroll, bool authorized);

    // ============ MODIFIERS ============
    
    modifier onlyAuthorizedPayroll() {
        require(authorizedPayrolls[msg.sender], "Not authorized payroll");
        _;
    }
    
    modifier onlyActiveAllocation(uint256 allocationId) {
        require(tokenAllocations[allocationId].isActive, "Allocation not active");
        _;
    }

    // ============ CONSTRUCTOR ============
    
    constructor() Ownable(msg.sender) {}

    // ============ ALLOCATION MANAGEMENT ============
    
    /**
     * @dev Create a new token allocation for distribution
     * @param token Governance token address
     * @param totalAllocation Total amount to allocate
     * @param vestingPeriod Vesting period in seconds
     * @param cliffPeriod Cliff period in seconds
     */
    function createTokenAllocation(
        address token,
        uint256 totalAllocation,
        uint256 vestingPeriod,
        uint256 cliffPeriod
    ) external onlyOwner returns (uint256 allocationId) {
        require(token != address(0), "Invalid token address");
        require(totalAllocation > 0, "Allocation must be positive");
        require(vestingPeriod > 0, "Vesting period must be positive");
        require(cliffPeriod <= vestingPeriod, "Cliff cannot exceed vesting period");
        
        allocationId = nextAllocationId++;
        
        tokenAllocations[allocationId] = TokenAllocation({
            token: token,
            totalAllocation: totalAllocation,
            distributedAmount: 0,
            vestingPeriod: vestingPeriod,
            cliffPeriod: cliffPeriod,
            isActive: true
        });
        
        // Transfer tokens to this contract
        IERC20(token).safeTransferFrom(msg.sender, address(this), totalAllocation);
        
        emit TokenAllocationCreated(allocationId, token, totalAllocation, vestingPeriod, cliffPeriod);
    }
    
    /**
     * @dev Allocate tokens to an employee
     * @param employee Employee address
     * @param allocationId Token allocation ID
     * @param amount Amount to allocate
     * @param startTime When vesting should start
     */
    function allocateToEmployee(
        address employee,
        uint256 allocationId,
        uint256 amount,
        uint256 startTime
    ) external onlyOwner onlyActiveAllocation(allocationId) {
        _allocateToEmployee(employee, allocationId, amount, startTime);
    }
    
    /**
     * @dev Internal function to allocate tokens to an employee
     * @param employee Employee address
     * @param allocationId Token allocation ID
     * @param amount Amount to allocate
     * @param startTime When vesting should start
     */
    function _allocateToEmployee(
        address employee,
        uint256 allocationId,
        uint256 amount,
        uint256 startTime
    ) internal {
        require(employee != address(0), "Invalid employee address");
        require(amount > 0, "Amount must be positive");
        require(startTime >= block.timestamp, "Start time must be in future");
        
        TokenAllocation storage allocation = tokenAllocations[allocationId];
        require(
            allocation.distributedAmount + amount <= allocation.totalAllocation,
            "Exceeds total allocation"
        );
        
        uint256 vestingEndTime = startTime + allocation.vestingPeriod;
        
        employeeAllocations[employee][allocationId] = EmployeeAllocation({
            allocationId: allocationId,
            totalAmount: amount,
            claimedAmount: 0,
            startTime: startTime,
            vestingEndTime: vestingEndTime,
            isActive: true
        });
        
        employeeAllocationIds[employee].push(allocationId);
        allocation.distributedAmount += amount;
        
        emit EmployeeAllocated(employee, allocationId, amount, startTime, vestingEndTime);
    }
    
    /**
     * @dev Batch allocate tokens to multiple employees
     * @param employees Array of employee addresses
     * @param allocationId Token allocation ID
     * @param amounts Array of amounts to allocate
     * @param startTime When vesting should start
     */
    function batchAllocateToEmployees(
        address[] calldata employees,
        uint256 allocationId,
        uint256[] calldata amounts,
        uint256 startTime
    ) external onlyOwner onlyActiveAllocation(allocationId) {
        require(employees.length == amounts.length, "Arrays length mismatch");
        require(employees.length > 0, "Empty arrays");
        
        for (uint256 i = 0; i < employees.length; i++) {
            _allocateToEmployee(employees[i], allocationId, amounts[i], startTime);
        }
    }

    // ============ TOKEN CLAIMING ============
    
    /**
     * @dev Claim vested tokens
     * @param allocationId Token allocation ID
     */
    function claimTokens(uint256 allocationId) 
        external 
        nonReentrant 
        onlyActiveAllocation(allocationId) 
    {
        EmployeeAllocation storage allocation = employeeAllocations[msg.sender][allocationId];
        require(allocation.isActive, "Allocation not active");
        require(block.timestamp >= allocation.startTime, "Vesting not started");
        
        uint256 claimableAmount = _calculateClaimableAmount(allocation, allocationId);
        require(claimableAmount > 0, "No tokens to claim");
        
        allocation.claimedAmount += claimableAmount;
        
        TokenAllocation storage tokenAllocation = tokenAllocations[allocationId];
        IERC20(tokenAllocation.token).safeTransfer(msg.sender, claimableAmount);
        
        emit TokensClaimed(msg.sender, allocationId, claimableAmount, allocation.claimedAmount);
    }
    
    /**
     * @dev Calculate claimable amount for an allocation
     * @param allocation Employee allocation
     * @param allocationId Token allocation ID
     * @return claimableAmount Amount that can be claimed
     */
    function _calculateClaimableAmount(
        EmployeeAllocation memory allocation, 
        uint256 allocationId
    ) internal view returns (uint256 claimableAmount) {
        TokenAllocation memory tokenAllocation = tokenAllocations[allocationId];
        
        if (block.timestamp < allocation.startTime) {
            return 0;
        }
        
        // Check cliff period
        if (block.timestamp < allocation.startTime + tokenAllocation.cliffPeriod) {
            return 0;
        }
        
        // Calculate vested amount
        uint256 timeElapsed = block.timestamp - allocation.startTime;
        uint256 vestingDuration = allocation.vestingEndTime - allocation.startTime;
        
        if (timeElapsed >= vestingDuration) {
            // Fully vested
            claimableAmount = allocation.totalAmount;
        } else {
            // Linear vesting
            claimableAmount = (allocation.totalAmount * timeElapsed) / vestingDuration;
        }
        
        // Subtract already claimed amount
        if (claimableAmount > allocation.claimedAmount) {
            claimableAmount -= allocation.claimedAmount;
        } else {
            claimableAmount = 0;
        }
    }

    // ============ PAYROLL INTEGRATION ============
    
    /**
     * @dev Authorize a payroll contract to trigger allocations
     * @param payroll Payroll contract address
     * @param authorized Whether to authorize
     */
    function setAuthorizedPayroll(address payroll, bool authorized) external onlyOwner {
        authorizedPayrolls[payroll] = authorized;
        emit PayrollAuthorized(payroll, authorized);
    }
    
    /**
     * @dev Auto-allocate tokens when salary is paid (called by payroll contract)
     * @param employee Employee address
     * @param allocationId Token allocation ID
     * @param salaryAmount Salary amount paid
     * @param allocationRate Rate of token allocation per salary unit
     */
    function autoAllocateOnSalary(
        address employee,
        uint256 allocationId,
        uint256 salaryAmount,
        uint256 allocationRate
    ) external onlyAuthorizedPayroll onlyActiveAllocation(allocationId) {
        require(employee != address(0), "Invalid employee address");
        require(salaryAmount > 0, "Salary amount must be positive");
        require(allocationRate > 0, "Allocation rate must be positive");
        
        uint256 allocationAmount = (salaryAmount * allocationRate) / 10000; // Basis points
        
        if (allocationAmount > 0) {
            // Check if employee already has allocation
            EmployeeAllocation storage existingAllocation = employeeAllocations[employee][allocationId];
            uint256 vestingEndTime;
            
            if (existingAllocation.isActive) {
                // Add to existing allocation
                existingAllocation.totalAmount += allocationAmount;
                vestingEndTime = existingAllocation.vestingEndTime;
            } else {
                // Create new allocation
                TokenAllocation storage tokenAllocation = tokenAllocations[allocationId];
                vestingEndTime = block.timestamp + tokenAllocation.vestingPeriod;
                
                employeeAllocations[employee][allocationId] = EmployeeAllocation({
                    allocationId: allocationId,
                    totalAmount: allocationAmount,
                    claimedAmount: 0,
                    startTime: block.timestamp,
                    vestingEndTime: vestingEndTime,
                    isActive: true
                });
                
                employeeAllocationIds[employee].push(allocationId);
            }
            
            tokenAllocations[allocationId].distributedAmount += allocationAmount;
            
            emit EmployeeAllocated(employee, allocationId, allocationAmount, block.timestamp, vestingEndTime);
        }
    }

    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get claimable amount for an employee
     * @param employee Employee address
     * @param allocationId Token allocation ID
     * @return claimableAmount Amount that can be claimed
     */
    function getClaimableAmount(address employee, uint256 allocationId) 
        external 
        view 
        returns (uint256 claimableAmount) 
    {
        EmployeeAllocation memory allocation = employeeAllocations[employee][allocationId];
        if (!allocation.isActive) {
            return 0;
        }
        
        return _calculateClaimableAmount(allocation, allocationId);
    }
    
    /**
     * @dev Get employee allocation IDs
     * @param employee Employee address
     * @return allocationIds Array of allocation IDs
     */
    function getEmployeeAllocations(address employee) 
        external 
        view 
        returns (uint256[] memory allocationIds) 
    {
        return employeeAllocationIds[employee];
    }
    
    /**
     * @dev Get allocation details
     * @param allocationId Allocation ID
     * @return allocation Allocation details
     */
    function getAllocation(uint256 allocationId) 
        external 
        view 
        returns (TokenAllocation memory allocation) 
    {
        return tokenAllocations[allocationId];
    }

    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Deactivate an allocation
     * @param allocationId Allocation ID to deactivate
     */
    function deactivateAllocation(uint256 allocationId) external onlyOwner onlyActiveAllocation(allocationId) {
        tokenAllocations[allocationId].isActive = false;
        emit AllocationDeactivated(allocationId);
    }
    
    /**
     * @dev Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency withdraw tokens
     * @param token Token address
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }
}
