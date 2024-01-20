# Starter Smart Contracts

This repository contains a list of smart contracts. These contracts can be used as template to build functionality on.

## Getting Started

Follow the instructions below to set up and use the smart contracts on your local development environment.

### Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) (Node.js package manager)
- [Hardhat](https://hardhat.org/) (Ethereum development environment)

### Installation

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/beno-webtiga/smart-contract-starter.git
   ```

2. Change into the project directory:

   ```bash
   cd smart-contract-starter
   ```

3. Install project dependencies:

   ```bash
   npm install
   ```

### Running Tests

To run the test cases for the smart contracts, use the following command:

```bash
npx hardhat test
```

### Compiling Contracts

Compile the smart contracts with the following command:

```bash
npx hardhat compile
```

### Deployment

Deploy the smart contracts to a specific network using the deployment script. Replace `<network_name>` with the desired network name (e.g., "sepolia," "goerli").

```bash
npx hardhat run --network <network_name> scripts/1_deploy_IRegistry.js
```

### Environment Configuration

Make sure to set up your environment variables. Create a `.env` file and add the following variables:

```
INFURA_API_KEY=<your_infura_api_key>
ADMIN_ADDRESS=<admin_wallet_address>
ADMIN_PRIVATE_KEY=<admin_wallet_private_key>
ETHERSCAN_API_KEY=<etherscan_api_key>
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

