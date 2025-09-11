#!/bin/bash

# Deploy to Polygon Amoy Testnet
echo "🚀 Deploying to Polygon Amoy Testnet..."

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

if [ -z "$POLYGON_AMOY_RPC_URL" ]; then
    echo "❌ POLYGON_AMOY_RPC_URL not set in .env file"
    exit 1
fi

# Deploy contracts
echo "📦 Deploying contracts to Polygon Amoy..."
forge script script/Deploy.s.sol \
    --rpc-url $POLYGON_AMOY_RPC_URL \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --verify \
    --etherscan-api-key $POLYGONSCAN_API_KEY \
    --slow

echo "✅ Polygon Amoy deployment complete!"

# Save contract addresses
echo "📝 Saving contract addresses..."
forge script script/Deploy.s.sol \
    --rpc-url $POLYGON_AMOY_RPC_URL \
    --private-key $PRIVATE_KEY \
    --broadcast > polygon-amoy-deployment-output.txt

echo "📄 Contract addresses saved to polygon-amoy-deployment-output.txt"

# Extract and display contract addresses
echo "📋 Contract Addresses:"
echo "PayrollStream: $(grep 'PayrollStream deployed at:' polygon-amoy-deployment-output.txt | cut -d' ' -f4)"
echo "YieldStrategy: $(grep 'YieldStrategy deployed at:' polygon-amoy-deployment-output.txt | cut -d' ' -f4)"
echo "DAOTokenDistribution: $(grep 'DAOTokenDistribution deployed at:' polygon-amoy-deployment-output.txt | cut -d' ' -f4)"

# Create frontend environment file
echo "📝 Creating frontend environment file..."
cat > ../frontend/.env.local << EOF
# Contract addresses on Polygon Amoy
NEXT_PUBLIC_PAYROLL_CONTRACT_ADDRESS=$(grep 'PayrollStream deployed at:' polygon-amoy-deployment-output.txt | cut -d' ' -f4)
NEXT_PUBLIC_YIELD_STRATEGY_CONTRACT_ADDRESS=$(grep 'YieldStrategy deployed at:' polygon-amoy-deployment-output.txt | cut -d' ' -f4)
NEXT_PUBLIC_DAO_DISTRIBUTION_CONTRACT_ADDRESS=$(grep 'DAOTokenDistribution deployed at:' polygon-amoy-deployment-output.txt | cut -d' ' -f4)

# Network configuration
NEXT_PUBLIC_CHAIN_ID=80002
NEXT_PUBLIC_RPC_URL=$POLYGON_AMOY_RPC_URL
NEXT_PUBLIC_BLOCK_EXPLORER=https://amoy.polygonscan.com

# WalletConnect Project ID (get from https://cloud.walletconnect.com/)
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your-project-id-here
EOF

echo "✅ Frontend environment file created at ../frontend/.env.local"
