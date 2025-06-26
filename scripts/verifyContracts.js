// Quick test script to verify contract deployment
// Run this with: node scripts/verifyContracts.js

const { getContract, readContract } = require('thirdweb');
const { baseSepolia } = require('thirdweb/chains');
const { createThirdwebClient } = require('thirdweb');

// Load environment variables
require('dotenv').config();

const CONTRACT_ADDRESSES = {
  CRYDA_TOKEN: '0xc59b7ad852ed9be49d1f338dd0e61a6fd234d901', 
  RIDE_SHARE: '0x0c33146ee82b8653e8a648d96b0c9c8cdaea6118',
};

const client = createThirdwebClient({
  clientId: process.env.EXPO_PUBLIC_THIRDWEB_CLIENT_ID,
});

async function verifyContracts() {
  console.log('Verifying contract deployments...');
  console.log('Chain:', baseSepolia.name, baseSepolia.id);
  console.log('Client ID configured:', !!process.env.EXPO_PUBLIC_THIRDWEB_CLIENT_ID);
  
  // Simple ABI for testing
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
    }
  ];

  // Test CRYDA Token
  try {
    console.log('\n=== Testing CRYDA Token ===');
    console.log('Address:', CONTRACT_ADDRESSES.CRYDA_TOKEN);
    
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

    console.log('✅ CRYDA Token contract found!');
    console.log('Name:', name);
    console.log('Symbol:', symbol);
    console.log('Total Supply:', totalSupply.toString());
    
  } catch (error) {
    console.log('❌ CRYDA Token contract not found or error:', error.message);
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

    console.log('✅ RideShare contract found!');
    console.log('Ride Counter:', rideCounter.toString());
    
  } catch (error) {
    console.log('❌ RideShare contract not found or error:', error.message);
  }
}

verifyContracts().catch(console.error);
