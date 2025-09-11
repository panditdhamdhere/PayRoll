# Decentralized Payroll Protocol

> **Web3 salary streaming with automatic tax withholding and benefits**

A comprehensive decentralized payroll system that enables real-time salary streaming, automatic tax withholding, DeFi yield generation, and DAO governance token distribution.

## 🚀 Features

### Core Features
- **Real-time Salary Streaming**: Stream salaries by the second (enhanced Sablier-like functionality)
- **Automatic Tax Withholding**: Built-in tax calculation and withholding for compliance
- **DeFi Yield Generation**: Automatic yield generation on unstreamed funds
- **DAO Integration**: Seamless governance token distribution and voting

### Business Benefits
- **Massive TAM**: Every crypto company needs payroll infrastructure
- **Sticky Users**: Core business infrastructure with high retention
- **Revenue Model**: Fees on yield generation and protocol usage
- **Real Problem**: Current solutions are fragmented and lack integration

## 🏗️ Architecture

### Smart Contracts
- **PayrollStream**: Main contract for salary streaming and tax withholding
- **YieldStrategy**: DeFi yield generation strategies for unstreamed funds
- **DAOTokenDistribution**: Governance token distribution and vesting

### Frontend
- **Next.js 14**: Modern React framework with App Router
- **Tailwind CSS**: Utility-first CSS framework
- **RainbowKit**: Wallet connection and Web3 integration
- **Wagmi**: React hooks for Ethereum

## 📁 Project Structure

```
payroll/
├── contracts/                 # Smart contracts (Foundry)
│   ├── src/
│   │   ├── PayrollStream.sol
│   │   ├── YieldStrategy.sol
│   │   └── DAOTokenDistribution.sol
│   ├── test/
│   ├── scripts/               # Deployment scripts
│   ├── env.example           # Environment template
│   └── foundry.toml
├── frontend/                  # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── hooks/            # Contract interaction hooks
│   │   ├── config/           # Contract addresses
│   │   └── providers/
│   ├── env.example           # Environment template
│   └── package.json
├── setup-env.sh              # Environment setup script
├── ENVIRONMENT_SETUP.md      # Environment configuration guide
├── POLYGON_AMOY_DEPLOYMENT.md # Deployment guide
└── README.md
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ 
- Foundry (for smart contracts)
- Git

### Environment Setup

1. **Quick Setup** (Recommended):
   ```bash
   ./setup-env.sh
   ```

2. **Manual Setup**:
   ```bash
   # Contracts
   cd contracts && cp env.example .env
   
   # Frontend
   cd frontend && cp env.example .env.local
   ```

3. **Fill in your values** in the environment files (see [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) for details)

### Smart Contracts Setup

1. **Install Foundry** (if not already installed):
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

2. **Navigate to contracts directory**:
```bash
cd contracts
```

3. **Install dependencies**:
```bash
forge install
```

4. **Build contracts**:
```bash
forge build
```

5. **Run tests**:
```bash
forge test
```

### Frontend Setup

1. **Navigate to frontend directory**:
```bash
cd frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. **Run development server**:
```bash
npm run dev
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the frontend directory:

```env
# WalletConnect Project ID (get from https://cloud.walletconnect.com/)
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your-project-id-here

# Contract addresses (update after deployment)
NEXT_PUBLIC_PAYROLL_CONTRACT_ADDRESS=
NEXT_PUBLIC_YIELD_STRATEGY_CONTRACT_ADDRESS=
NEXT_PUBLIC_DAO_DISTRIBUTION_CONTRACT_ADDRESS=
```

### Contract Deployment

1. **Deploy contracts** (example with Anvil):
```bash
# Start local node
anvil

# Deploy contracts
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --private-key $PRIVATE_KEY --broadcast
```

2. **Update contract addresses** in your environment variables

## 📊 Smart Contract Details

### PayrollStream Contract

**Key Functions:**
- `addEmployee()`: Add new employee to payroll system
- `createStream()`: Create salary stream for employee
- `claimSalary()`: Claim available salary with automatic tax withholding
- `cancelStream()`: Cancel active stream and refund remaining amount

**Features:**
- Real-time salary streaming (per-second granularity)
- Automatic tax calculation and withholding
- Multi-token support (ERC-20)
- Pausable for emergency situations

### YieldStrategy Contract

**Key Functions:**
- `deposit()`: Deposit tokens for yield generation
- `withdraw()`: Withdraw tokens and generated yield
- `setTokenStrategy()`: Configure yield strategy for specific tokens

**Features:**
- Multiple DeFi protocol integration (Aave, Compound, Yearn)
- Automatic yield calculation based on time and APY
- Risk management and strategy selection

### DAOTokenDistribution Contract

**Key Functions:**
- `createTokenAllocation()`: Create new token allocation pool
- `allocateToEmployee()`: Allocate tokens to specific employee
- `claimTokens()`: Claim vested tokens
- `autoAllocateOnSalary()`: Auto-allocate tokens based on salary payments

**Features:**
- Linear and cliff vesting schedules
- Automatic allocation based on salary payments
- Governance integration for voting rights

## 🎨 Frontend Features

### Dashboard Views
- **Employee View**: View and claim salary streams
- **Employer View**: Manage employees and create streams
- **Yield View**: Monitor and manage yield generation
- **DAO View**: Governance token allocation and voting

### Key Components
- **Header**: Navigation and wallet connection
- **Hero**: Landing page with feature overview
- **Features**: Detailed feature showcase
- **Dashboard**: Main application interface

## 🧪 Testing

### Smart Contract Tests
```bash
# Run all tests
forge test

# Run specific test file
forge test --match-path test/PayrollStream.t.sol

# Run with gas reporting
forge test --gas-report
```

### Frontend Tests
```bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint
```

## 🚀 Deployment

### Smart Contracts
1. **Testnet Deployment**:
```bash
forge script script/Deploy.s.sol --rpc-url $TESTNET_RPC --private-key $PRIVATE_KEY --broadcast --verify
```

2. **Mainnet Deployment**:
```bash
forge script script/Deploy.s.sol --rpc-url $MAINNET_RPC --private-key $PRIVATE_KEY --broadcast --verify
```

### Frontend
1. **Vercel Deployment**:
```bash
npm run build
# Deploy to Vercel
```

2. **Other Platforms**:
```bash
npm run build
npm run start
```

## 📈 Roadmap

### Phase 1 (Current)
- ✅ Core smart contracts
- ✅ Basic frontend interface
- ✅ Web3 integration

### Phase 2
- [ ] Advanced yield strategies
- [ ] Multi-chain support
- [ ] Mobile app

### Phase 3
- [ ] Enterprise features
- [ ] Advanced analytics
- [ ] API integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Documentation**: [Coming Soon]
- **Discord**: [Coming Soon]
- **Twitter**: [Coming Soon]

## ⚠️ Disclaimer

This software is provided "as is" without warranty. Use at your own risk. Always audit smart contracts before using with real funds.

---

**Built with ❤️ for the Web3 ecosystem**
