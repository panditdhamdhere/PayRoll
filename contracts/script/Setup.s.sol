// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {PayrollStream} from "../src/PayrollStream.sol";
import {YieldStrategy} from "../src/YieldStrategy.sol";
import {DAOTokenDistribution} from "../src/DAOTokenDistribution.sol";

contract SetupScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        // Get contract addresses from environment or use defaults
        address payrollAddress = vm.envOr("PAYROLL_ADDRESS", address(0));
        address yieldAddress = vm.envOr("YIELD_ADDRESS", address(0));
        address daoAddress = vm.envOr("DAO_ADDRESS", address(0));
        
        require(payrollAddress != address(0), "PayrollStream address not provided");
        require(yieldAddress != address(0), "YieldStrategy address not provided");
        require(daoAddress != address(0), "DAOTokenDistribution address not provided");
        
        console.log("Setting up contracts...");
        console.log("PayrollStream:", payrollAddress);
        console.log("YieldStrategy:", yieldAddress);
        console.log("DAOTokenDistribution:", daoAddress);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Get contract instances
        PayrollStream payroll = PayrollStream(payrollAddress);
        YieldStrategy yield = YieldStrategy(yieldAddress);
        DAOTokenDistribution dao = DAOTokenDistribution(daoAddress);
        
        // Set up integrations
        yield.setPayrollContract(payrollAddress);
        console.log("YieldStrategy payroll contract set");
        
        dao.setAuthorizedPayroll(payrollAddress, true);
        console.log("DAO distribution authorized payroll contract");
        
        payroll.setYieldStrategy(yieldAddress);
        console.log("PayrollStream yield strategy set");
        
        // Add some supported tokens for yield generation
        address usdc = vm.envOr("USDC_ADDRESS", address(0));
        address dai = vm.envOr("DAI_ADDRESS", address(0));
        
        if (usdc != address(0)) {
            yield.setSupportedToken(usdc, true);
            console.log("USDC added as supported token");
        }
        
        if (dai != address(0)) {
            yield.setSupportedToken(dai, true);
            console.log("DAI added as supported token");
        }
        
        vm.stopBroadcast();
        
        console.log("\n=== SETUP COMPLETE ===");
        console.log("All contracts are now properly integrated");
    }
}
