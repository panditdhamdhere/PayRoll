# Deployment Guide

This guide covers deploying the Decentralized Payroll Protocol smart contracts to various networks.

## Prerequisites

1. **Foundry installed**: Follow the [Foundry installation guide](https://book.getfoundry.org/getting-started/installation)
2. **Environment setup**: Copy `deploy.config.example` to `.env` and fill in your values
3. **Network access**: Ensure you have RPC URLs for your target networks
4. **Private key**: Have a private key with sufficient funds for deployment

## Configuration

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Required
PRIVATE_KEY=your_private_key_without_0x_prefix
ETHERSCAN_API_KEY=your_etherscan_api_key

# Optional (defaults to deployer address)
FEE_RECIPIENT=0x1234567890123456789012345678901234567890

# Network RPC URLs
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your_api_key
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_api_key
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/your_api_key
ARBITRUM_RPC_URL=https://arb-mainnet.g.alchemy.com/v2/your_api_key
OPTIMISM_RPC_URL=https://opt-mainnet.g.alchemy.com/v2/your_api_key

# Token addresses (for setup)
USDC_ADDRESS=0xA0b86a33E6441c8C06DdD5c8c4b7C8c8c8c8c8c8
DAI_ADDRESS=0x6B175474E89094C44Da98b954EedeAC495271d0F
```

## Deployment Options

### 1. Local Development (Anvil)

For local testing and development:

```bash
# Start Anvil (if not already running)
anvil

# Deploy to local network
./scripts/deploy-local.sh
```

**Default Anvil Account:**
- Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

### 2. Sepolia Testnet

For testing on Ethereum testnet:

```bash
./scripts/deploy-sepolia.sh
```

**Requirements:**
- Sepolia ETH for gas fees
- Etherscan API key for verification

### 3. Ethereum Mainnet

For production deployment:

```bash
./scripts/deploy-mainnet.sh
```

**Requirements:**
- Mainnet ETH for gas fees
- Etherscan API key for verification
- Confirmation prompt (safety measure)

## Manual Deployment

If you prefer manual deployment:

### Deploy Contracts

```bash
# Deploy to Sepolia
forge script script/Deploy.s.sol \
    --rpc-url $SEPOLIA_RPC_URL \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --verify \
    --etherscan-api-key $ETHERSCAN_API_KEY

# Deploy to Mainnet
forge script script/Deploy.s.sol \
    --rpc-url $MAINNET_RPC_URL \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --verify \
    --etherscan-api-key $ETHERSCAN_API_KEY
```

### Setup Contracts

After deployment, run the setup script to configure integrations:

```bash
# Set environment variables for deployed contracts
export PAYROLL_ADDRESS=0x...
export YIELD_ADDRESS=0x...
export DAO_ADDRESS=0x...

# Run setup
forge script script/Setup.s.sol \
    --rpc-url $SEPOLIA_RPC_URL \
    --private-key $PRIVATE_KEY \
    --broadcast
```

## Contract Addresses

After deployment, you'll get contract addresses like:

```
=== DEPLOYMENT SUMMARY ===
PayrollStream: 0x1234567890123456789012345678901234567890
YieldStrategy: 0x2345678901234567890123456789012345678901
DAOTokenDistribution: 0x3456789012345678901234567890123456789012
Fee Recipient: 0x4567890123456789012345678901234567890123
Deployer: 0x5678901234567890123456789012345678901234
```

## Verification

Contracts are automatically verified during deployment. If verification fails, you can verify manually:

```bash
# Verify individual contracts
forge verify-contract 0x1234567890123456789012345678901234567890 PayrollStream $ETHERSCAN_API_KEY
forge verify-contract 0x2345678901234567890123456789012345678901 YieldStrategy $ETHERSCAN_API_KEY
forge verify-contract 0x3456789012345678901234567890123456789012 DAOTokenDistribution $ETHERSCAN_API_KEY
```

## Post-Deployment Setup

### 1. Update Frontend Configuration

Update your frontend environment variables:

```env
NEXT_PUBLIC_PAYROLL_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
NEXT_PUBLIC_YIELD_STRATEGY_CONTRACT_ADDRESS=0x2345678901234567890123456789012345678901
NEXT_PUBLIC_DAO_DISTRIBUTION_CONTRACT_ADDRESS=0x3456789012345678901234567890123456789012
```

### 2. Add Supported Tokens

Add supported tokens for yield generation:

```bash
# Add USDC support
cast send $YIELD_ADDRESS "setSupportedToken(address,bool)" $USDC_ADDRESS true \
    --rpc-url $SEPOLIA_RPC_URL \
    --private-key $PRIVATE_KEY

# Add DAI support
cast send $YIELD_ADDRESS "setSupportedToken(address,bool)" $DAI_ADDRESS true \
    --rpc-url $SEPOLIA_RPC_URL \
    --private-key $PRIVATE_KEY
```

### 3. Configure Protocol Fees

Set protocol fee rate (optional, defaults to 1%):

```bash
# Set 2% protocol fee
cast send $PAYROLL_ADDRESS "setProtocolFeeRate(uint256)" 200 \
    --rpc-url $SEPOLIA_RPC_URL \
    --private-key $PRIVATE_KEY
```

## Gas Estimation

Estimated gas costs for deployment:

| Network | Gas Price | Estimated Cost |
|---------|-----------|----------------|
| Sepolia | 1 gwei | ~0.01 ETH |
| Mainnet | 20 gwei | ~0.1 ETH |
| Polygon | 30 gwei | ~0.01 MATIC |
| Arbitrum | 0.1 gwei | ~0.001 ETH |

## Troubleshooting

### Common Issues

1. **Insufficient funds**: Ensure your account has enough ETH for gas fees
2. **Verification fails**: Check your Etherscan API key and try manual verification
3. **RPC errors**: Verify your RPC URLs are correct and accessible
4. **Private key format**: Ensure private key doesn't include `0x` prefix

### Debug Commands

```bash
# Check account balance
cast balance $DEPLOYER_ADDRESS --rpc-url $RPC_URL

# Check gas price
cast gas-price --rpc-url $RPC_URL

# Simulate deployment
forge script script/Deploy.s.sol --rpc-url $RPC_URL --private-key $PRIVATE_KEY
```

## Security Considerations

1. **Private Key Security**: Never commit private keys to version control
2. **Multi-sig Deployment**: Consider using a multi-sig wallet for mainnet deployment
3. **Gradual Rollout**: Test thoroughly on testnets before mainnet deployment
4. **Access Control**: Review and configure access controls after deployment

## Network-Specific Notes

### Ethereum Mainnet
- High gas costs
- Requires Etherscan verification
- Consider using EIP-1559 transactions

### Polygon
- Lower gas costs
- Faster block times
- Requires PolygonScan verification

### Arbitrum/Optimism
- L2 scaling solutions
- Lower gas costs than mainnet
- Requires respective block explorers for verification

## Support

For deployment issues:
1. Check the troubleshooting section
2. Review Foundry documentation
3. Check network status and RPC connectivity
4. Verify environment variables and configuration
