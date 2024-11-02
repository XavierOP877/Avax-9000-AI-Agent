# NexusAI

A modern DeFi application that allows users to interact with the Avalanche blockchain using natural language commands. Powered by Brian AI, this application simplifies cryptocurrency transactions by converting plain English instructions into blockchain operations.

## 🌟 Features

### Wallet Management
- Private key-based wallet connection
- Real-time balance tracking
- Secure transaction signing
- Support for Avalanche Fuji Testnet

### Transaction Capabilities
- **Token Transfers**: Send AVAX to any address
- **Token Swaps**: Exchange AVAX for USDC via Trader Joe DEX
- **Balance Checking**: View AVAX and USDC balances
- **Transaction History**: Track past transactions with detailed information

### Natural Language Processing
Process commands like:
- "Transfer 0.1 AVAX to 0x..."
- "Swap 1 AVAX for USDC using Trader Joe"
- "Swap 1 AVAX to USDC when AVAX is below 40"

### User Interface
- Clean, modern design with Tailwind CSS
- Real-time transaction updates
- Interactive command suggestions
- Transaction history visualization
- Block explorer integration

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git
- A wallet with testnet AVAX

### Installation

1. Clone the repository:
```bash
git clone https://github.com/XavierOP877/NexusAI.git
cd avax-9000-ai-agent
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
BRIAN_API_KEY=your_brian_api_key
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Getting Testnet Tokens

Get Testnet AVAX from the [Avalanche Faucet](https://faucet.avax.network/)

## 🔧 Configuration

### Smart Contract Addresses (Avalanche Fuji Testnet)
```typescript
TRADERJOE_ROUTER = "0xd7f655E3376cE2D7A2b08fF01Eb3B1023191A901"
USDC_ADDRESS = "0x5425890298aed601595a70AB815c96711a31Bc65"
WAVAX_ADDRESS = "0xd00ae08403B9bbb9124bB305C09058E32C39A48c"
```

### Environment Variables
- `NEXT_PUBLIC_AVALANCHE_RPC_URL`: Avalanche Fuji testnet RPC URL
- `BRIAN_API_KEY`: API key for Brian AI integration

## 📖 Usage Guide

1. **Connect Wallet**
   - Enter your private key (Fuji testnet only!)
   - Click "Connect Wallet"

2. **Execute Commands**
   - Type natural language commands in the prompt box
   - Use suggested examples for guidance
   - Click execute or press enter

3. **View Results**
   - Transaction status appears in real-time
   - Check transaction history for details
   - Click "View on Explorer" for blockchain details

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS
- **Blockchain Interaction**: ethers.js
- **AI Integration**: Brian AI API
- **Network**: Avalanche Fuji Testnet

### Key Components
- Natural language processing interface
- Wallet connection management
- Transaction execution engine
- History tracking system
- Real-time balance updates

## 🛡️ Security Considerations

- Never use a mainnet private key
- This is a testnet application
- Keep your Brian AI API key secure

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Note**: This is a testnet application. Do not use real private keys or send actual transactions without proper testing and understanding of the risks involved.