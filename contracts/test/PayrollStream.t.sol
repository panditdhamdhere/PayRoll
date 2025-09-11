// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {PayrollStream} from "../src/PayrollStream.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Mock ERC20 token for testing
contract MockERC20 is IERC20 {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    
    uint256 private _totalSupply;
    string public name;
    string public symbol;
    uint8 public decimals;
    
    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }
    
    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }
    
    function balanceOf(address account) external view override returns (uint256) {
        return _balances[account];
    }
    
    function transfer(address to, uint256 amount) external override returns (bool) {
        _balances[msg.sender] -= amount;
        _balances[to] += amount;
        return true;
    }
    
    function allowance(address owner, address spender) external view override returns (uint256) {
        return _allowances[owner][spender];
    }
    
    function approve(address spender, uint256 amount) external override returns (bool) {
        _allowances[msg.sender][spender] = amount;
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) external override returns (bool) {
        _allowances[from][msg.sender] -= amount;
        _balances[from] -= amount;
        _balances[to] += amount;
        return true;
    }
    
    function mint(address to, uint256 amount) external {
        _balances[to] += amount;
        _totalSupply += amount;
    }
}

contract PayrollStreamTest is Test {
    PayrollStream public payrollStream;
    MockERC20 public usdc;
    
    address public owner = address(0x1);
    address public feeRecipient = address(0x2);
    address public employer = address(0x3);
    address public employee = address(0x4);
    address public taxRecipient = address(0x5);
    
    function setUp() public {
        vm.startPrank(owner);
        
        // Deploy contracts
        payrollStream = new PayrollStream(feeRecipient);
        usdc = new MockERC20("USD Coin", "USDC", 6);
        
        // Mint tokens to employer
        usdc.mint(employer, 1000000 * 10**6); // 1M USDC
        
        vm.stopPrank();
    }
    
    function testAddEmployee() public {
        vm.startPrank(owner);
        
        uint256 employeeId = payrollStream.addEmployee(
            employee,
            1000, // 0.001 USDC per second
            block.timestamp,
            block.timestamp + 365 days,
            2500, // 25% tax rate
            taxRecipient
        );
        
        assertEq(employeeId, 1);
        
        // Check employee data
        (address recipient, uint256 salaryPerSecond, uint256 startTime, uint256 endTime, uint256 lastClaimed, bool isActive, uint256 taxRate, address taxRecipientAddr) = payrollStream.employees(employeeId);
        
        assertEq(recipient, employee);
        assertEq(salaryPerSecond, 1000);
        assertEq(isActive, true);
        assertEq(taxRate, 2500);
        assertEq(taxRecipientAddr, taxRecipient);
        
        vm.stopPrank();
    }
    
    function testCreateStream() public {
        // First add employee
        vm.startPrank(owner);
        uint256 employeeId = payrollStream.addEmployee(
            employee,
            1000,
            block.timestamp,
            block.timestamp + 365 days,
            2500,
            taxRecipient
        );
        vm.stopPrank();
        
        // Create stream
        vm.startPrank(employer);
        usdc.approve(address(payrollStream), 100000 * 10**6); // 100k USDC
        
        uint256 streamId = payrollStream.createStream(
            employeeId,
            address(usdc),
            100000 * 10**6 // 100k USDC
        );
        
        assertEq(streamId, 1);
        
        // Check stream data
        (uint256 totalAmount, uint256 remainingAmount, uint256 startTime, uint256 endTime, bool isActive, address token, address streamEmployer) = payrollStream.streams(streamId);
        
        assertEq(totalAmount, 100000 * 10**6);
        assertEq(remainingAmount, 100000 * 10**6);
        assertEq(isActive, true);
        assertEq(token, address(usdc));
        assertEq(streamEmployer, employer);
        
        vm.stopPrank();
    }
    
    function testClaimSalary() public {
        // Setup: Add employee and create stream
        vm.startPrank(owner);
        uint256 employeeId = payrollStream.addEmployee(
            employee,
            1000, // 0.001 USDC per second
            block.timestamp,
            block.timestamp + 365 days,
            2500, // 25% tax rate
            taxRecipient
        );
        vm.stopPrank();
        
        vm.startPrank(employer);
        usdc.approve(address(payrollStream), 100000 * 10**6);
        uint256 streamId = payrollStream.createStream(employeeId, address(usdc), 100000 * 10**6);
        vm.stopPrank();
        
        // Fast forward time by 1 hour (3600 seconds)
        vm.warp(block.timestamp + 3600);
        
        // Claim salary
        vm.startPrank(employee);
        
        uint256 claimableAmount = payrollStream.getClaimableAmount(employeeId, streamId);
        assertGt(claimableAmount, 0);
        
        uint256 employeeBalanceBefore = usdc.balanceOf(employee);
        uint256 taxRecipientBalanceBefore = usdc.balanceOf(taxRecipient);
        
        payrollStream.claimSalary(employeeId, streamId);
        
        uint256 employeeBalanceAfter = usdc.balanceOf(employee);
        uint256 taxRecipientBalanceAfter = usdc.balanceOf(taxRecipient);
        
        // Check that employee received net amount (after tax)
        uint256 expectedNetAmount = (claimableAmount * 7500) / 10000; // 75% after 25% tax
        assertEq(employeeBalanceAfter - employeeBalanceBefore, expectedNetAmount);
        
        // Check that tax recipient received tax amount
        uint256 expectedTaxAmount = (claimableAmount * 2500) / 10000; // 25% tax
        assertEq(taxRecipientBalanceAfter - taxRecipientBalanceBefore, expectedTaxAmount);
        
        vm.stopPrank();
    }
    
    function testCancelStream() public {
        // Setup: Add employee and create stream
        vm.startPrank(owner);
        uint256 employeeId = payrollStream.addEmployee(
            employee,
            1000,
            block.timestamp,
            block.timestamp + 365 days,
            2500,
            taxRecipient
        );
        vm.stopPrank();
        
        vm.startPrank(employer);
        usdc.approve(address(payrollStream), 100000 * 10**6);
        uint256 streamId = payrollStream.createStream(employeeId, address(usdc), 100000 * 10**6);
        
        uint256 employerBalanceBefore = usdc.balanceOf(employer);
        
        // Cancel stream
        payrollStream.cancelStream(streamId);
        
        uint256 employerBalanceAfter = usdc.balanceOf(employer);
        
        // Check that employer received refund
        assertEq(employerBalanceAfter - employerBalanceBefore, 100000 * 10**6);
        
        // Check that stream is inactive
        (,,,, bool isActive,,) = payrollStream.streams(streamId);
        assertEq(isActive, false);
        
        vm.stopPrank();
    }
}
