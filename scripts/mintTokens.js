// Mint CRYDA tokens script
// Run this with: node scripts/mintTokens.js

const { getContract, prepareContractCall, sendTransaction } = require('thirdweb');
const { baseSepolia } = require('thirdweb/chains');
const { createThirdwebClient } = require('thirdweb');
const { privateKeyToAccount } = require('thirdweb/wallets');

require('dotenv').config();

const CONTRACT_ADDRESSES = {
  CRYDA_TOKEN: '0xc59b7ad852ed9be49d1f338dd0e61a6fd234d901', // Your deployed CRYDA token address
  RIDE_SHARE: '0x0c33146ee82b8653e8a648d96b0c9c8cdaea6118', // Your deployed ride share address
};

const client = createThirdwebClient({
  clientId: process.env.EXPO_PUBLIC_THIRDWEB_CLIENT_ID,
});

// ⚠️ IMPORTANT: Add your private key to .env file
// PRIVATE_KEY=your_private_key_here (without 0x prefix)

async function mintTokens() {
  try {
    console.log('🪙 Minting CRYDA tokens...');
    
    // Check if private key is available
    if (!process.env.PRIVATE_KEY) {
      console.log('❌ Private key not found in .env file');
      console.log('Add PRIVATE_KEY=your_private_key_here to your .env file');
      console.log('⚠️ Or use Remix IDE method instead');
      return;
    }

    // Create account from private key
    let privateKey = process.env.PRIVATE_KEY;
    
    // Remove 0x prefix if present
    if (privateKey.startsWith('0x')) {
      privateKey = privateKey.slice(2);
    }
    
    // Validate private key length (should be 64 characters)
    if (privateKey.length !== 64) {
      console.log('❌ Invalid private key format');
      console.log('Private key should be 64 characters (32 bytes) without 0x prefix');
      console.log('Current length:', privateKey.length);
      console.log('Use Remix IDE method instead for safety');
      return;
    }
    
    const account = privateKeyToAccount({
      client,
      privateKey: `0x${privateKey}`,
    });

    console.log('Minting from account:', account.address);

    // Create contract instance
    const tokenABI = [
      {
        type: "function",
        name: "mint",
        inputs: [
          { name: "to", type: "address" },
          { name: "amount", type: "uint256" }
        ],
        outputs: [],
        stateMutability: "nonpayable"
      },
      {
        type: "function",
        name: "balanceOf",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ type: "uint256" }],
        stateMutability: "view"
      }
    ];

    const tokenContract = getContract({
      client,
      chain: baseSepolia,
      address: CONTRACT_ADDRESSES.CRYDA_TOKEN,
      abi: tokenABI,
    });

    // Mint 10,000 CRYDA tokens (adjust as needed)
    const amountToMint = '10000000000000000000000'; // 10,000 tokens in wei

    const transaction = prepareContractCall({
      contract: tokenContract,
      method: "mint",
      params: [account.address, BigInt(amountToMint)],
    });

    console.log('Sending mint transaction...');
    const result = await sendTransaction({
      transaction,
      account,
    });

    console.log('✅ Tokens minted successfully!');
    console.log('Transaction hash:', result.transactionHash);
    console.log('Amount minted: 10,000 CRYDA');
    console.log('View on Base Sepolia:', `https://sepolia.basescan.org/tx/${result.transactionHash}`);

  } catch (error) {
    console.error('❌ Error minting tokens:', error);
  }
}

console.log(`
🪙 CRYDA Token Minting Script

This script will mint 10,000 CRYDA tokens to your wallet.

Options:
1. Add PRIVATE_KEY to .env file and run this script
2. Use Remix IDE (easier and safer)

Contract Address: ${CONTRACT_ADDRESSES.CRYDA_TOKEN}
`);

mintTokens().catch(console.error);
