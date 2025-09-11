// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {PayrollStream} from "../src/PayrollStream.sol";
import {YieldStrategy} from "../src/YieldStrategy.sol";
import {DAOTokenDistribution} from "../src/DAOTokenDistribution.sol";

contract DeployWithVerificationScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying contracts with verification...");
        console.log("Deployer:", deployer);
        console.log("Account balance:", deployer.balance);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy contracts
        YieldStrategy yieldStrategy = new YieldStrategy();
        DAOTokenDistribution daoDistribution = new DAOTokenDistribution();
        
        address feeRecipient = vm.envOr("FEE_RECIPIENT", deployer);
        PayrollStream payrollStream = new PayrollStream(feeRecipient);
        
        // Set up integrations
        yieldStrategy.setPayrollContract(address(payrollStream));
        daoDistribution.setAuthorizedPayroll(address(payrollStream), true);
        payrollStream.setYieldStrategy(address(yieldStrategy));
        
        vm.stopBroadcast();
        
        // Verification commands (to be run separately)
        console.log("\n=== VERIFICATION COMMANDS ===");
        console.log("Run these commands to verify contracts:");
        console.log("forge verify-contract", address(yieldStrategy), "YieldStrategy", vm.envString("ETHERSCAN_API_KEY"));
        console.log("forge verify-contract", address(daoDistribution), "DAOTokenDistribution", vm.envString("ETHERSCAN_API_KEY"));
        console.log("forge verify-contract", address(payrollStream), "PayrollStream", vm.envString("ETHERSCAN_API_KEY"));
        
        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("PayrollStream:", address(payrollStream));
        console.log("YieldStrategy:", address(yieldStrategy));
        console.log("DAOTokenDistribution:", address(daoDistribution));
    }
}
