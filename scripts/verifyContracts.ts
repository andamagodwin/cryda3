// Quick test script to verify contract deployment
// Run this with: npx ts-node scripts/verifyContracts.ts

import { getContract, readContract } from 'thirdweb';
import { baseSepolia } from 'thirdweb/chains';
import { createThirdwebClient } from 'thirdweb';
import { CONTRACT_ADDRESSES } from '../constants/contracts';

const client = createThirdwebClient({
  clientId: process.env.EXPO_PUBLIC_THIRDWEB_CLIENT_ID as string,
});

async function verifyContracts() {
  console.log('Verifying contract deployments...');
  console.log('Chain:', baseSepolia.name, baseSepolia.id);
  
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
  ] as const;

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
    console.log('❌ CRYDA Token contract not found or error:', error);
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
    ] as const;
    
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
    console.log('❌ RideShare contract not found or error:', error);
  }
}

if (require.main === module) {
  verifyContracts().catch(console.error);
}

export { verifyContracts };
