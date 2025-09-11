// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {PayrollStream} from "../src/PayrollStream.sol";
import {YieldStrategy} from "../src/YieldStrategy.sol";
import {DAOTokenDistribution} from "../src/DAOTokenDistribution.sol";

contract TestDeployScript is Script {
    function run() external {
        // Use default Anvil private key for testing
        uint256 deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Testing deployment with account:", deployer);
        console.log("Account balance:", deployer.balance);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy YieldStrategy first (no dependencies)
        YieldStrategy yieldStrategy = new YieldStrategy();
        console.log("YieldStrategy deployed at:", address(yieldStrategy));
        
        // Deploy DAOTokenDistribution (no dependencies)
        DAOTokenDistribution daoDistribution = new DAOTokenDistribution();
        console.log("DAOTokenDistribution deployed at:", address(daoDistribution));
        
        // Deploy PayrollStream with deployer as fee recipient
        PayrollStream payrollStream = new PayrollStream(deployer);
        console.log("PayrollStream deployed at:", address(payrollStream));
        
        // Set up integrations
        yieldStrategy.setPayrollContract(address(payrollStream));
        console.log("YieldStrategy payroll contract set");
        
        daoDistribution.setAuthorizedPayroll(address(payrollStream), true);
        console.log("DAO distribution authorized payroll contract");
        
        payrollStream.setYieldStrategy(address(yieldStrategy));
        console.log("PayrollStream yield strategy set");
        
        vm.stopBroadcast();
        
        // Output deployment summary
        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("PayrollStream:", address(payrollStream));
        console.log("YieldStrategy:", address(yieldStrategy));
        console.log("DAOTokenDistribution:", address(daoDistribution));
        console.log("Fee Recipient:", deployer);
        console.log("Deployer:", deployer);
    }
}
