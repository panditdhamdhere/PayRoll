#!/bin/bash

# Deploy to Base Sepolia Testnet
echo "🚀 Deploying to Base Sepolia Testnet..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please copy env.example to .env and fill in your values."
    echo "💡 Run: cp env.example .env"
    exit 1
fi

# Load environment variables
source .env

# Check required variables
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ PRIVATE_KEY not set in .env file"
    exit 1
fi

if [ -z "$BASE_SEPOLIA_RPC_URL" ]; then
    echo "❌ BASE_SEPOLIA_RPC_URL not set in .env file"
    exit 1
fi

# Deploy contracts
echo "📦 Deploying contracts to Base Sepolia..."
forge script script/Deploy.s.sol \
    --rpc-url $BASE_SEPOLIA_RPC_URL \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --verify \
    --etherscan-api-key $ETHERSCAN_API_KEY \
    --slow

echo "✅ Base Sepolia deployment complete!"

# Save contract addresses
echo "📝 Saving contract addresses..."
forge script script/Deploy.s.sol \
    --rpc-url $BASE_SEPOLIA_RPC_URL \
    --private-key $PRIVATE_KEY \
    --broadcast > base-sepolia-deployment-output.txt

echo "📄 Contract addresses saved to base-sepolia-deployment-output.txt"

# Extract and display contract addresses
echo "📋 Contract Addresses:"
echo "PayrollStream: $(grep 'PayrollStream deployed at:' base-sepolia-deployment-output.txt | cut -d' ' -f4)"
echo "YieldStrategy: $(grep 'YieldStrategy deployed at:' base-sepolia-deployment-output.txt | cut -d' ' -f4)"
echo "DAOTokenDistribution: $(grep 'DAOTokenDistribution deployed at:' base-sepolia-deployment-output.txt | cut -d' ' -f4)"

# Create frontend environment file
echo "📝 Creating frontend environment file..."
cat > ../frontend/.env.local << EOF
# Contract addresses on Base Sepolia
NEXT_PUBLIC_PAYROLL_CONTRACT_ADDRESS=$(grep 'PayrollStream deployed at:' base-sepolia-deployment-output.txt | cut -d' ' -f4)
NEXT_PUBLIC_YIELD_STRATEGY_CONTRACT_ADDRESS=$(grep 'YieldStrategy deployed at:' base-sepolia-deployment-output.txt | cut -d' ' -f4)
NEXT_PUBLIC_DAO_DISTRIBUTION_CONTRACT_ADDRESS=$(grep 'DAOTokenDistribution deployed at:' base-sepolia-deployment-output.txt | cut -d' ' -f4)

# Network configuration
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_RPC_URL=$BASE_SEPOLIA_RPC_URL
NEXT_PUBLIC_BLOCK_EXPLORER=https://sepolia.basescan.org

# WalletConnect Project ID (get from https://cloud.walletconnect.com/)
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your-project-id-here
EOF

echo "✅ Frontend environment file created at ../frontend/.env.local"
