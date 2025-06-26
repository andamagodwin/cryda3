// Test script to verify deployment and add tokens
// Run this after deployment: node scripts/testDeployment.js

const { getContract, readContract, prepareContractCall } = require('thirdweb');
const { baseSepolia } = require('thirdweb/chains');
const { createThirdwebClient } = require('thirdweb');

require('dotenv').config();

// ⚠️ UPDATE THESE ADDRESSES AFTER DEPLOYMENT
const CONTRACT_ADDRESSES = {
  CRYDA_TOKEN: '0x...', // Your deployed CRYDA token address
  RIDE_SHARE: '0x...', // Your deployed ride share address
};

const client = createThirdwebClient({
  clientId: process.env.EXPO_PUBLIC_THIRDWEB_CLIENT_ID,
});

async function testDeployment() {
  console.log('🔍 Testing contract deployment on Base Sepolia...');
  console.log('Chain:', baseSepolia.name, baseSepolia.id);
  
  // Test CRYDA Token
  try {
    console.log('\n=== Testing CRYDA Token ===');
    console.log('Address:', CONTRACT_ADDRESSES.CRYDA_TOKEN);
    
    const tokenABI = [
      {
        type: "function",
        name: "name",
        inputs: [],
        outputs: [{ type: "string" }],
        stateMutability: "view"
      },
      {
        type: "function",
        name: "symbol", 
        inputs: [],
        outputs: [{ type: "string" }],
        stateMutability: "view"
      },
      {
        type: "function",
        name: "totalSupply",
        inputs: [],
        outputs: [{ type: "uint256" }],
        stateMutability: "view"
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

    const name = await readContract({
      contract: tokenContract,
      method: "name",
      params: [],
    });
    
    const symbol = await readContract({
      contract: tokenContract,
      method: "symbol", 
      params: [],
    });
    
    const totalSupply = await readContract({
      contract: tokenContract,
      method: "totalSupply",
      params: [],
    });

    console.log('✅ CRYDA Token deployed successfully!');
    console.log('Name:', name);
    console.log('Symbol:', symbol);
    console.log('Total Supply:', totalSupply.toString());
    
    // Test balance for a sample address
    const testAddress = '0x742d35Cc6634C0532925a3b8D5c3e30e5c6F8A29'; // Replace with your address
    try {
      const balance = await readContract({
        contract: tokenContract,
        method: "balanceOf",
        params: [testAddress],
      });
      console.log(`Balance for ${testAddress}:`, balance.toString());
    } catch (e) {
      console.log('Balance check failed (address may not have tokens)');
    }
    
  } catch (error) {
    console.log('❌ CRYDA Token test failed:', error.message);
    console.log('Make sure to update CONTRACT_ADDRESSES.CRYDA_TOKEN with your deployed address');
  }

  // Test RideShare Contract
  try {
    console.log('\n=== Testing RideShare Contract ===');
    console.log('Address:', CONTRACT_ADDRESSES.RIDE_SHARE);
    
    const rideShareABI = [
      {
        type: "function",
        name: "rideCounter",
        inputs: [],
        outputs: [{ type: "uint256" }],
        stateMutability: "view"
      },
      {
        type: "function",
        name: "crydaToken",
        inputs: [],
        outputs: [{ type: "address" }],
        stateMutability: "view"
      }
    ];
    
    const rideShareContract = getContract({
      client,
      chain: baseSepolia,
      address: CONTRACT_ADDRESSES.RIDE_SHARE,
      abi: rideShareABI,
    });

    const rideCounter = await readContract({
      contract: rideShareContract,
      method: "rideCounter",
      params: [],
    });
    
    const crydaTokenAddr = await readContract({
      contract: rideShareContract,
      method: "crydaToken",
      params: [],
    });

    console.log('✅ RideShare contract deployed successfully!');
    console.log('Ride Counter:', rideCounter.toString());
    console.log('CRYDA Token Address in contract:', crydaTokenAddr);
    
    // Verify the addresses match
    if (crydaTokenAddr.toLowerCase() === CONTRACT_ADDRESSES.CRYDA_TOKEN.toLowerCase()) {
      console.log('✅ Token addresses match!');
    } else {
      console.log('⚠️ Token address mismatch - check deployment');
    }
    
  } catch (error) {
    console.log('❌ RideShare contract test failed:', error.message);
    console.log('Make sure to update CONTRACT_ADDRESSES.RIDE_SHARE with your deployed address');
  }
}

console.log(`
🚀 DEPLOYMENT CHECKLIST:

1. Deploy CrydaToken.sol to Base Sepolia via Remix
2. Deploy CrydaRideShare.sol with CrydaToken address as constructor param
3. Update CONTRACT_ADDRESSES in this file with deployed addresses
4. Run this script to verify deployment
5. Mint some CRYDA tokens to your address for testing
6. Update the addresses in constants/contracts.ts

Current addresses to update:
- CRYDA_TOKEN: ${CONTRACT_ADDRESSES.CRYDA_TOKEN}
- RIDE_SHARE: ${CONTRACT_ADDRESSES.RIDE_SHARE}
`);

if (CONTRACT_ADDRESSES.CRYDA_TOKEN !== '0x...' && CONTRACT_ADDRESSES.RIDE_SHARE !== '0x...') {
  testDeployment().catch(console.error);
} else {
  console.log('Please update the contract addresses first!');
}
