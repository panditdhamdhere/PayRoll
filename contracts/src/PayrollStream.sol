// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title PayrollStream
 * @dev Decentralized payroll streaming with automatic tax withholding and yield generation
 * @notice This contract enables real-time salary streaming with built-in tax calculations
 */
contract PayrollStream is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    // ============ STRUCTS ============
    
    struct Employee {
        address recipient;
        uint256 salaryPerSecond;
        uint256 startTime;
        uint256 endTime;
        uint256 lastClaimed;
        bool isActive;
        uint256 taxRate; // Basis points (e.g., 2500 = 25%)
        address taxRecipient;
    }

    struct Stream {
        uint256 totalAmount;
        uint256 remainingAmount;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        address token;
        address employer;
    }

    // ============ STATE VARIABLES ============
    
    mapping(uint256 => Employee) public employees;
    mapping(uint256 => Stream) public streams;
    mapping(address => uint256[]) public employeeStreams;
    mapping(address => uint256[]) public employerStreams;
    
    uint256 public nextEmployeeId = 1;
    uint256 public nextStreamId = 1;
    
    // Fee configuration
    uint256 public protocolFeeRate = 100; // 1% in basis points
    address public feeRecipient;
    
    // Yield generation
    address public yieldStrategy;
    mapping(address => uint256) public yieldBalances;
    
    // ============ EVENTS ============
    
    event EmployeeAdded(
        uint256 indexed employeeId,
        address indexed recipient,
        uint256 salaryPerSecond,
        uint256 startTime,
        uint256 endTime,
        uint256 taxRate
    );
    
    event StreamCreated(
        uint256 indexed streamId,
        address indexed employer,
        address indexed token,
        uint256 totalAmount,
        uint256 startTime,
        uint256 endTime
    );
    
    event SalaryClaimed(
        uint256 indexed employeeId,
        uint256 indexed streamId,
        uint256 amount,
        uint256 taxAmount,
        uint256 netAmount
    );
    
    event StreamCancelled(uint256 indexed streamId);
    event EmployeeDeactivated(uint256 indexed employeeId);
    event YieldGenerated(address indexed token, uint256 amount);

    // ============ MODIFIERS ============
    
    modifier onlyActiveEmployee(uint256 employeeId) {
        require(employees[employeeId].isActive, "Employee not active");
        _;
    }
    
    modifier onlyActiveStream(uint256 streamId) {
        require(streams[streamId].isActive, "Stream not active");
        _;
    }

    // ============ CONSTRUCTOR ============
    
    constructor(address _feeRecipient) Ownable(msg.sender) {
        feeRecipient = _feeRecipient;
    }

    // ============ EMPLOYEE MANAGEMENT ============
    
    /**
     * @dev Add a new employee to the payroll system
     * @param recipient Employee's wallet address
     * @param salaryPerSecond Salary amount per second (in wei)
     * @param startTime When the salary stream should start
     * @param endTime When the salary stream should end
     * @param taxRate Tax rate in basis points (e.g., 2500 = 25%)
     * @param taxRecipient Address to receive tax payments
     */
    function addEmployee(
        address recipient,
        uint256 salaryPerSecond,
        uint256 startTime,
        uint256 endTime,
        uint256 taxRate,
        address taxRecipient
    ) external onlyOwner returns (uint256 employeeId) {
        require(recipient != address(0), "Invalid recipient");
        require(salaryPerSecond > 0, "Salary must be positive");
        require(startTime < endTime, "Invalid time range");
        require(taxRate <= 10000, "Tax rate too high");
        require(taxRecipient != address(0), "Invalid tax recipient");
        
        employeeId = nextEmployeeId++;
        
        employees[employeeId] = Employee({
            recipient: recipient,
            salaryPerSecond: salaryPerSecond,
            startTime: startTime,
            endTime: endTime,
            lastClaimed: startTime,
            isActive: true,
            taxRate: taxRate,
            taxRecipient: taxRecipient
        });
        
        emit EmployeeAdded(employeeId, recipient, salaryPerSecond, startTime, endTime, taxRate);
    }
    
    /**
     * @dev Add a new employee to the payroll system (public version)
     * @param recipient Employee's wallet address
     * @param salaryPerSecond Salary amount per second (in wei)
     * @param startTime When the salary stream should start
     * @param endTime When the salary stream should end
     * @param taxRate Tax rate in basis points (e.g., 2500 = 25%)
     * @param taxRecipient Address to receive tax payments
     * @return employeeId The assigned employee ID
     */
    function addEmployeePublic(
        address recipient,
        uint256 salaryPerSecond,
        uint256 startTime,
        uint256 endTime,
        uint256 taxRate,
        address taxRecipient
    ) external returns (uint256 employeeId) {
        require(recipient != address(0), "Invalid recipient");
        require(salaryPerSecond > 0, "Salary must be positive");
        require(startTime < endTime, "Invalid time range");
        require(taxRate <= 10000, "Tax rate too high");
        require(taxRecipient != address(0), "Invalid tax recipient");
        
        employeeId = nextEmployeeId++;
        
        employees[employeeId] = Employee({
            recipient: recipient,
            salaryPerSecond: salaryPerSecond,
            startTime: startTime,
            endTime: endTime,
            lastClaimed: startTime,
            isActive: true,
            taxRate: taxRate,
            taxRecipient: taxRecipient
        });
        
        emit EmployeeAdded(employeeId, recipient, salaryPerSecond, startTime, endTime, taxRate);
    }
    
    /**
     * @dev Deactivate an employee
     * @param employeeId ID of the employee to deactivate
     */
    function deactivateEmployee(uint256 employeeId) external onlyOwner onlyActiveEmployee(employeeId) {
        employees[employeeId].isActive = false;
        emit EmployeeDeactivated(employeeId);
    }

    // ============ STREAM MANAGEMENT ============
    
    /**
     * @dev Create a new salary stream
     * @param employeeId ID of the employee
     * @param token ERC20 token address for payment
     * @param totalAmount Total amount to stream
     */
    function createStream(
        uint256 employeeId,
        address token,
        uint256 totalAmount
    ) external onlyActiveEmployee(employeeId) returns (uint256 streamId) {
        Employee memory employee = employees[employeeId];
        require(block.timestamp >= employee.startTime, "Stream not started");
        require(block.timestamp < employee.endTime, "Stream ended");
        require(totalAmount > 0, "Amount must be positive");
        
        IERC20(token).safeTransferFrom(msg.sender, address(this), totalAmount);
        
        streamId = nextStreamId++;
        
        streams[streamId] = Stream({
            totalAmount: totalAmount,
            remainingAmount: totalAmount,
            startTime: employee.startTime,
            endTime: employee.endTime,
            isActive: true,
            token: token,
            employer: msg.sender
        });
        
        employeeStreams[employee.recipient].push(streamId);
        employerStreams[msg.sender].push(streamId);
        
        emit StreamCreated(streamId, msg.sender, token, totalAmount, employee.startTime, employee.endTime);
    }
    
    /**
     * @dev Create a salary stream for an employee (employer version)
     * @param employeeId ID of the employee
     * @param token Token address to stream
     * @param totalAmount Total amount to stream
     * @return streamId The created stream ID
     */
    function createStreamForEmployee(
        uint256 employeeId,
        address token,
        uint256 totalAmount
    ) external returns (uint256 streamId) {
        Employee memory employee = employees[employeeId];
        require(employee.recipient != address(0), "Employee does not exist");
        require(employee.isActive, "Employee not active");
        require(block.timestamp >= employee.startTime, "Stream not started");
        require(block.timestamp < employee.endTime, "Stream ended");
        require(totalAmount > 0, "Amount must be positive");
        
        IERC20(token).safeTransferFrom(msg.sender, address(this), totalAmount);
        
        streamId = nextStreamId++;
        
        streams[streamId] = Stream({
            totalAmount: totalAmount,
            remainingAmount: totalAmount,
            startTime: employee.startTime,
            endTime: employee.endTime,
            isActive: true,
            token: token,
            employer: msg.sender
        });
        
        employeeStreams[employee.recipient].push(streamId);
        employerStreams[msg.sender].push(streamId);
        
        emit StreamCreated(streamId, msg.sender, token, totalAmount, employee.startTime, employee.endTime);
    }
    
    /**
     * @dev Cancel an active stream
     * @param streamId ID of the stream to cancel
     */
    function cancelStream(uint256 streamId) external onlyActiveStream(streamId) {
        Stream storage stream = streams[streamId];
        require(msg.sender == stream.employer || msg.sender == owner(), "Not authorized");
        
        stream.isActive = false;
        
        // Refund remaining amount to employer
        if (stream.remainingAmount > 0) {
            IERC20(stream.token).safeTransfer(stream.employer, stream.remainingAmount);
        }
        
        emit StreamCancelled(streamId);
    }

    // ============ SALARY CLAIMING ============
    
    /**
     * @dev Claim available salary for an employee
     * @param employeeId ID of the employee
     * @param streamId ID of the stream to claim from
     */
    function claimSalary(uint256 employeeId, uint256 streamId) 
        external 
        nonReentrant 
        onlyActiveEmployee(employeeId) 
        onlyActiveStream(streamId) 
    {
        Employee storage employee = employees[employeeId];
        Stream storage stream = streams[streamId];
        
        require(msg.sender == employee.recipient, "Not the recipient");
        require(block.timestamp >= employee.startTime, "Stream not started");
        
        uint256 claimableAmount = _calculateClaimableAmount(employee, stream);
        require(claimableAmount > 0, "No amount to claim");
        
        // Update last claimed time
        employee.lastClaimed = block.timestamp;
        stream.remainingAmount -= claimableAmount;
        
        // Calculate tax and net amount
        uint256 taxAmount = (claimableAmount * employee.taxRate) / 10000;
        uint256 netAmount = claimableAmount - taxAmount;
        
        // Transfer net amount to employee
        IERC20(stream.token).safeTransfer(employee.recipient, netAmount);
        
        // Transfer tax to tax recipient
        if (taxAmount > 0) {
            IERC20(stream.token).safeTransfer(employee.taxRecipient, taxAmount);
        }
        
        // Deactivate stream if fully claimed
        if (stream.remainingAmount == 0) {
            stream.isActive = false;
        }
        
        emit SalaryClaimed(employeeId, streamId, claimableAmount, taxAmount, netAmount);
    }
    
    /**
     * @dev Calculate claimable amount for an employee from a stream
     * @param employee Employee struct
     * @param stream Stream struct
     * @return claimableAmount Amount that can be claimed
     */
    function _calculateClaimableAmount(Employee memory employee, Stream memory stream) 
        internal 
        view 
        returns (uint256 claimableAmount) 
    {
        uint256 currentTime = block.timestamp;
        uint256 endTime = employee.endTime < stream.endTime ? employee.endTime : stream.endTime;
        
        if (currentTime <= employee.lastClaimed) {
            return 0;
        }
        
        uint256 timeElapsed = currentTime - employee.lastClaimed;
        uint256 maxClaimable = timeElapsed * employee.salaryPerSecond;
        
        // Cap at remaining stream amount
        claimableAmount = maxClaimable < stream.remainingAmount ? maxClaimable : stream.remainingAmount;
        
        // Cap at stream end time
        if (currentTime > endTime) {
            uint256 timeFromEnd = currentTime - endTime;
            uint256 maxFromEnd = timeFromEnd * employee.salaryPerSecond;
            if (maxFromEnd < claimableAmount) {
                claimableAmount = maxFromEnd;
            }
        }
    }

    // ============ YIELD GENERATION ============
    
    /**
     * @dev Set the yield generation strategy
     * @param _yieldStrategy Address of the yield strategy contract
     */
    function setYieldStrategy(address _yieldStrategy) external onlyOwner {
        yieldStrategy = _yieldStrategy;
    }
    
    /**
     * @dev Generate yield on unstreamed funds
     * @param token Token to generate yield for
     * @param amount Amount to invest in yield generation
     */
    function generateYield(address token, uint256 amount) external onlyOwner {
        require(yieldStrategy != address(0), "Yield strategy not set");
        require(amount > 0, "Amount must be positive");
        
        IERC20(token).safeTransfer(yieldStrategy, amount);
        yieldBalances[token] += amount;
        
        emit YieldGenerated(token, amount);
    }

    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get claimable amount for an employee from a stream
     * @param employeeId ID of the employee
     * @param streamId ID of the stream
     * @return claimableAmount Amount that can be claimed
     */
    function getClaimableAmount(uint256 employeeId, uint256 streamId) 
        external 
        view 
        returns (uint256 claimableAmount) 
    {
        Employee memory employee = employees[employeeId];
        Stream memory stream = streams[streamId];
        
        if (!employee.isActive || !stream.isActive) {
            return 0;
        }
        
        return _calculateClaimableAmount(employee, stream);
    }
    
    /**
     * @dev Get employee streams
     * @param employee Address of the employee
     * @return streamIds Array of stream IDs
     */
    function getEmployeeStreams(address employee) external view returns (uint256[] memory streamIds) {
        return employeeStreams[employee];
    }
    
    /**
     * @dev Get employer streams
     * @param employer Address of the employer
     * @return streamIds Array of stream IDs
     */
    function getEmployerStreams(address employer) external view returns (uint256[] memory streamIds) {
        return employerStreams[employer];
    }

    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Set protocol fee rate
     * @param _feeRate New fee rate in basis points
     */
    function setProtocolFeeRate(uint256 _feeRate) external onlyOwner {
        require(_feeRate <= 1000, "Fee rate too high"); // Max 10%
        protocolFeeRate = _feeRate;
    }
    
    /**
     * @dev Set fee recipient
     * @param _feeRecipient New fee recipient address
     */
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid address");
        feeRecipient = _feeRecipient;
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
}
