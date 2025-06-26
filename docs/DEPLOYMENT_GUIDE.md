# 🚀 Contract Deployment Guide for Remix IDE

## Step 1: Open Remix IDE
1. Go to https://remix.ethereum.org/
2. Create a new workspace or use the default

## Step 2: Create Contract Files

### Create CrydaToken.sol
1. In Remix, create a new file: `contracts/CrydaToken.sol`
2. Copy the CrydaToken.sol content from your project
3. The contract imports OpenZeppelin - Remix will auto-import these

### Create CrydaRideShare.sol  
1. Create a new file: `contracts/CrydaRideShare.sol`
2. Copy the CrydaRideShare.sol content from your project

## Step 3: Compile Contracts
1. Go to the "Solidity Compiler" tab (second icon)
2. Select Solidity version: `0.8.19` or higher
3. Click "Compile CrydaToken.sol"
4. Click "Compile CrydaRideShare.sol"
5. Ensure no compilation errors

## Step 4: Deploy to Base Sepolia Testnet

### Configure Network
1. Add Base Sepolia to MetaMask:
   - Network Name: Base Sepolia
   - RPC URL: https://sepolia.base.org
   - Chain ID: 84532
   - Currency Symbol: ETH
   - Block Explorer: https://sepolia.basescan.org

### Get Test ETH
1. Get Sepolia ETH from: https://sepoliafaucet.com/
2. Bridge to Base Sepolia using: https://bridge.base.org/

### Deploy CrydaToken First
1. Go to "Deploy & Run Transactions" tab
2. Select Environment: "Injected Provider - MetaMask"
3. Select Account: Your MetaMask account
4. Select Contract: "CrydaToken"
5. Enter constructor parameter: Your wallet address (for initialOwner)
6. Click "Deploy"
7. **COPY THE DEPLOYED TOKEN ADDRESS** - you'll need it!

### Deploy CrydaRideShare
1. Select Contract: "CrydaRideShare"
2. Enter constructor parameters:
   - _crydaToken: [PASTE TOKEN ADDRESS FROM ABOVE]
   - initialOwner: Your wallet address
3. Click "Deploy"
4. **COPY THE DEPLOYED RIDESHARE ADDRESS**

## Step 5: Verify Deployment
1. Check both contracts on Base Sepolia explorer: https://sepolia.basescan.org
2. Test a simple function call in Remix to ensure they work

## Step 6: Save Contract Addresses
Create a file with your deployed addresses:

```
CRYDA_TOKEN_ADDRESS=0x[your-token-address]
RIDESHARE_CONTRACT_ADDRESS=0x[your-rideshare-address]
```

## Step 7: Update Your App
Use these addresses in your React Native app configuration.

## 🎯 Quick Checklist:
- [ ] Both contracts compiled successfully
- [ ] MetaMask connected to Base Sepolia
- [ ] Have Base Sepolia ETH for gas
- [ ] CrydaToken deployed first
- [ ] CrydaRideShare deployed with token address
- [ ] Contract addresses saved
- [ ] Contracts verified on explorer

## 🆘 Common Issues:
- **Gas estimation failed**: Increase gas limit manually
- **Insufficient funds**: Get more Base Sepolia ETH
- **Compilation errors**: Check Solidity version (use 0.8.19+)
- **MetaMask issues**: Clear transaction queue and retry
